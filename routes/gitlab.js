var express = require("express");
var router = express.Router();
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

const Gitlab = require("../controller/gitlab");

/*
 * Gets the Gitlab project of the given user.
 * Outcome depends if the token is expired or incorrect, if it is the case, private projects won't be provided
 */
router.get("/projects/:projectId", function (req, res, next) {
  let project = { token: "invalid", project: {} };
  axios
    .get(getUserProjectsByIDGitlabURL(req.params.projectId), {
      headers: {
        "PRIVATE-TOKEN": req.headers.token || "",
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
                else if (error.response.status === 401) {
                  sendErrorMessage(res, 401, "User unauthorized to access this project");
                } else {
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
});

/*
 * Get a list of repository commits in a project
 */
router.get("/projects/:projectId/commits", function (req, res, next) {
  let commits = { token: "invalid", commits: [] };
  axios
    .get(getUserProjectCommitsByIDGitlabURL(req.params.projectId), {
      headers: {
        "PRIVATE-TOKEN": req.body.token || "",
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
});

module.exports = router;
