var express = require("express");
var router = express.Router({ mergeParams: true });
const axios = require("axios");
const { validateGitlab } = require("../utils/validations");
const { testGitlabToken } = require("../utils/test");
const { sendErrorMessage } = require("../utils/error");
const {
  filterProyectIfValidToken,
  filterProyectIfInvalidToken,
  filterCommit,
  getUserProjectsGitlabURL,
  getUserProjectsByIDGitlabURL,
  getUserProjectCommitsByIDGitlabURL,
} = require("../utils/gitlab");

const User = require("../controller/user");
const Gitlab = require("../controller/gitlab");

/*
-------------------------Basic CRUD --------------------------------
*/

//Returns the Gitlab integration of the User with given ID.
router.get("/", function (req, res, next) {
  Gitlab.findOneByUser(req.params.id)
    .then(result => {
      if (result === null)
        return sendErrorMessage(res, 404, "The user with given id does not have any gitlab integration.");
      res.send(result);
    })
    .catch(err => {
      sendErrorMessage(res, 404, "The user with the given id does not have any gitlab integration.");
    });
});

//Returns the Gitlab integration of the User with given ID.
router.post("/", function (req, res, next) {
  const { error } = validateGitlab(req.body);

  //Verification
  if (error) return res.status(400).send(error.details[0].message);

  //ID parameter must be the same as username in the body
  if (req.params.id !== req.body.userId) sendErrorMessage(res, 400, "Username is immutable");

  //Check if the user exists
  User.findOne(req.params.id)
    .then(resultUser => {
      if (resultUser === null) return sendErrorMessage(res, 404, "The user with the given id was not found.");
      //A user must have only one Gitlab Integrations
      Gitlab.findOneByUser(req.params.id).then(result => {
        if (result !== null) {
          return sendErrorMessage(res, 400, "The user already has a Gitlab Integration");
        } else {
          let { userId, gitlab_username, token } = req.body;

          testGitlabToken(
            gitlab_username,
            token,
            response => {
              Gitlab.insertOne({
                userId,
                gitlab_username,
                token,
              }).then(re => {
                let updateUser = resultUser;
                updateUser.gitlab = re.ops[0]._id;
                User.replaceOne(req.params.id, updateUser)
                  .then(result => {
                    res.send(re.ops[0]);
                  })
                  .catch(err => {
                    sendErrorMessage(res, 404, "The user with the given id was not found.");
                  });
              });
            },
            error => {
              sendErrorMessage(res, 400, "The provided integration information is incorrect");
            }
          );
        }
      });
    })
    .catch(err => {
      sendErrorMessage(res, 404, "The user with the given id was not found.");
    });
});

//Returns the Gitlab integration of the User with given ID.
router.put("/", function (req, res, next) {
  const { error } = validateGitlab(req.body);

  //Verification
  if (error) return res.status(400).send(error.details[0].message);

  //ID parameter must be the same as username in the body
  if (req.params.id !== req.body.userId) sendErrorMessage(res, 400, "Username is immutable");

  //Check if the user exists
  User.findOne(req.params.id)
    .then(result => {
      if (result === null) return sendErrorMessage(res, 404, "The user with the given id was not found.");

      //A user must have only one Gitlab Integrations
      Gitlab.findOneByUser(req.params.id).then(result => {
        if (result === null) {
          return sendErrorMessage(res, 400, "The user does not have a Gitlab Integration to modify");
        } else {
          let { userId, gitlab_username, token } = req.body;

          testGitlabToken(
            gitlab_username,
            token,
            response => {
              Gitlab.replaceOneByUser(userId, {
                userId,
                gitlab_username,
                token,
              }).then(result => {
                res.send(result.ops[0]);
              });
            },
            error => {
              sendErrorMessage(res, 400, "The provided integration information is incorrect");
            }
          );
        }
      });
    })
    .catch(err => {
      sendErrorMessage(res, 404, "The user with the given id was not found.");
    });
});

// Delete the Gitlab Integration associated to the given user
router.delete("/", function (req, res, next) {
  Gitlab.deleteOneByUser(req.params.id)
    .then(result => {
      if (result.deletedCount === 0) return sendErrorMessage(res, 404, "The user with the given id was not found.");
      res.status(204).send();
    })
    .catch(err => {
      sendErrorMessage(res, 404, "The user with the given id was not found.");
    });
});

/*
------------------------- Projects --------------------------------
*/
/*
Get all the Gitlab projects of the given user. 
Outcome varies depending if the user provided the right integration information
*/
router.get("/projects", function (req, res, next) {
  let projects = { token: "invalid", public: [], private: [], internal: [] };

  Gitlab.findOneByUser(req.params.id)
    .then(result => {
      if (result === null)
        return sendErrorMessage(res, 404, "The user with the given id does not have any gitlab integration.");

      let { gitlab_username, token } = result;

      if (gitlab_username !== null) {
        let tokenToUse = "";
        if (token !== null && token !== "") tokenToUse = token;

        axios
          .get(getUserProjectsGitlabURL(gitlab_username), {
            headers: {
              "PRIVATE-TOKEN": tokenToUse,
            },
          })
          .then(response => {
            /*
							This is when the username and token are completely valid,
							I'll return public, internal and private projects
							*/
            if (response) {
              projects.token = "valid";
              response.data.forEach(p => {
                if (p.visibility === "public") projects.public.push(filterProyectIfValidToken(p));
                else if (p.visibility === "private") projects.private.push(filterProyectIfValidToken(p));
                else if (p.visibility === "internal") projects.internal.push(filterProyectIfValidToken(p));
              });
              //if (success) success(response.data);
            }
            res.send(projects);
          })
          .catch(error => {
            if (error.response) {
              if (error.response.status === 404) sendErrorMessage(res, 404, "User's Gitlab Username was not found");
              else if (error.response.status === 401) {
                /* 
									In this case, token is invalid but the user is, 
									so it will return only public and internal projects 
									*/
                axios
                  .get(getUserProjectsGitlabURL(gitlab_username), {})
                  .then(response => {
                    /*
											This is when the username and token are completely valid,
											I'll return public, internal and private projects
											*/
                    if (response) {
                      projects.token = "invalid";
                      response.data.forEach(p => {
                        projects.public.push(filterProyectIfInvalidToken(p));
                      });
                    }
                    res.send(projects);
                  })
                  .catch(error => {
                    sendErrorMessage(res, 404, error.message);
                  });
              }
            } else {
              sendErrorMessage(res, 404, error.message);
            }
          });
      } else {
        sendErrorMessage(res, 404, "The user does not have any Gitlab Username associated");
      }
    })
    .catch(err => {
      sendErrorMessage(res, 404, "The user with the given id does not have any gitlab integration.");
    });
});
/*
 * Gets the Gitlab project of the given user. It uses the Gitlab Integration associated to the user.
 * Outcome depends if the token is expired or incorrect, if it is the case, private projects won't be provided
 */
router.get("/projects/:projectId", function (req, res, next) {
  let project = { token: "invalid", project: {} };

  Gitlab.findOneByUser(req.params.id)
    .then(result => {
      if (result === null)
        return sendErrorMessage(res, 404, "The user with the given id does not have any gitlab integration.");

      let { gitlab_username, token } = result;

      if (gitlab_username !== null) {
        let tokenToUse = "";
        if (token !== null && token !== "") tokenToUse = token;

        axios
          .get(getUserProjectsByIDGitlabURL(req.params.projectId), {
            headers: {
              "PRIVATE-TOKEN": tokenToUse,
            },
          })
          .then(response => {
            /*
							This is when the username and token are completely valid,
							I'll return public, internal and private projects
							*/
            if (response) {
              project.token = "valid";
              project.project = filterProyectIfValidToken(response.data);
              //if (success) success(response.data);
            }
            res.send(project);
          })
          .catch(error => {
            if (error.response) {
              if (error.response.status === 404) sendErrorMessage(res, 404, "Gitlab Project was not found");
              else if (error.response.status === 401) {
                /* 
									In this case, token is invalid but the project could be public, 
									so it will return the project if it is public 
									*/
                axios
                  .get(getUserProjectsByIDGitlabURL(req.params.projectId), {})
                  .then(response => {
                    /*
											This is when the username and token are completely valid,
											I'll return public, internal and private projects
											*/
                    if (response) {
                      project.token = "invalid";
                      project.project = filterProyectIfInvalidToken(response.data);
                      //if (success) success(response.data);
                    }
                    res.send(project);
                  })
                  .catch(error => {
                    if (error.response) {
                      if (error.response.status === 404) sendErrorMessage(res, 404, "Gitlab Project was not found");
                      else {
                        sendErrorMessage(res, 404, "Unknown status");
                      }
                    } else {
                      sendErrorMessage(res, 404, error.message);
                    }
                  });
              }
            } else {
              sendErrorMessage(res, 404, error.message);
            }
          });
      } else {
        sendErrorMessage(res, 404, "The user does not have any Gitlab Username associated");
      }
    })
    .catch(err => {
      sendErrorMessage(res, 404, "The user with the given id does not have any gitlab integration.");
    });
});

/*
 * Get a list of repository commits in a project
 */
router.get("/projects/:projectId/commits", function (req, res, next) {
  let commits = { token: "invalid", commits: [] };

  Gitlab.findOneByUser(req.params.id)
    .then(result => {
      if (result === null)
        return sendErrorMessage(res, 404, "The user with the given id does not have any gitlab integration.");

      let { gitlab_username, token } = result;

      if (gitlab_username !== null) {
        let tokenToUse = "";
        if (token !== null && token !== "") tokenToUse = token;

        axios
          .get(getUserProjectCommitsByIDGitlabURL(req.params.projectId), {
            headers: {
              "PRIVATE-TOKEN": tokenToUse,
            },
          })
          .then(response => {
            /*
							This is when the username and token are completely valid,
							I'll return public, internal and private projects
							*/
            if (response) {
              commits.token = "valid";
              response.data.forEach(c => {
                commits.commits.push(filterCommit(c));
              });
              //if (success) success(response.data);
            }
            res.send(commits);
          })
          .catch(error => {
            if (error.response) {
              if (error.response.status === 404) sendErrorMessage(res, 404, "User's Gitlab Project was not found");
              else if (error.response.status === 401) {
                /* 
									In this case, token is invalid but the user is, 
									so it will return only public and internal projects 
									*/
                axios
                  .get(getUserProjectCommitsByIDGitlabURL(req.params.projectId), {})
                  .then(response => {
                    /*
											This is when the username and token are completely valid,
											I'll return public, internal and private projects
											*/
                    if (response) {
                      commits.token = "invalid";
                      response.data.forEach(c => {
                        commits.commits.push(filterCommit(c));
                      });
                    }
                    res.send(commits);
                  })
                  .catch(error => {
                    sendErrorMessage(res, 404, "User's Gitlab Project was not found");
                  });
              } else {
                sendErrorMessage(res, 404, error.message);
              }
            } else {
              sendErrorMessage(res, 404, error.message);
            }
          });
      } else {
        sendErrorMessage(res, 404, "The user does not have any Gitlab Username associated");
      }
    })
    .catch(err => {
      sendErrorMessage(res, 404, "The user with the given id does not have any gitlab integration.");
    });
});

module.exports = router;
