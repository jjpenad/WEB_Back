var express = require("express");
var router = express.Router();
const { validateUserCreate, validateUserUpdate } = require("../utils/validations");
const { sendErrorMessage } = require("../utils/error");
const userGitlab = require("./userGitlab");

const User = require("../controller/user");
const Organization = require("../controller/organization");

const defOrganization = process.env.MONGO_DEFAULT_ORG_ID;

// Nested routers
router.use("/:id/gitlab", userGitlab);

/*
-------------------------Basic CRUD--------------------------------
*/
router.get("/", function (req, res, next) {
  User.findAll().then(result => {
    res.send(result);
  });
});

router.get("/:id", function (req, res, next) {
  User.findOne(req.params.id)
    .then(result => {
      if (result === null) return sendErrorMessage(res, 404, "The user with the given id was not found.");
      res.status(200).send(result);
    })
    .catch(err => {
      sendErrorMessage(res, 404, "The user with the given id was not found.");
    });
});

// NEW
router.get("/:id/group", function (req, res, next) {
  User.findOne(req.params.id)
    .then(result => {
      if (result === null) return sendErrorMessage(res, 404, "The user with the given id was not found.");

      Organization.findOne(result.organization)
        .then(result2 => {
          if (result2 === null) return sendErrorMessage(res, 404, "The organization with the given id was not found.");

          User.findAllByOrg(result.organization).then(result3 => {
            res.send(result3);
          });
        })
        .catch(err => {
          sendErrorMessage(res, 404, "The organization with the given id was not found.");
        });
    })
    .catch(err => {
      sendErrorMessage(res, 404, "The user with the given id was not found.");
    });
});

router.post("/", function (req, res, next) {
  const { error } = validateUserCreate(req.body);

  if (error) return sendErrorMessage(res, 400, error.details[0].message);

  const { uid, email, nickname, firstName, lastName, avatar } = req.body;

  User.insertOne({
    _id: uid,
    email: email,
    nickname,
    organization: defOrganization,
    firstName,
    lastName,
    avatar,
    logins: 0,
    createdAt: Date.now(),
  })
    .then(result => {
      res.send(result.ops[0]);
    })
    .catch(error => {
      if (error.message.includes("duplicate")) res.send(req.body);
      else sendErrorMessage(res, 404, error.message);
    });
});

router.put("/:id", function (req, res, next) {
  const user = { uid: req.params.id, ...req.body };
  const { error } = validateUserUpdate(user);
  if (error) return sendErrorMessage(res, 400, error.details[0].message);

  delete user.uid;

  user.organization = defOrganization;

  User.replaceOne(req.params.id, user)
    .then(result => {
      if (result.ok !== 1) return sendErrorMessage(res, 404, "The user with the given id was not found.");
      res.status(200).send(result.value);
    })
    .catch(err => {
      sendErrorMessage(res, 404, "The user with the given id was not found.");
    });
});

router.delete("/:id", function (req, res, next) {
  User.deleteOne(req.params.id)
    .then(result => {
      if (result.deletedCount === 0) return sendErrorMessage(res, 404, "The user with the given id was not found.");

      res.status(204).send();
    })
    .catch(err => {
      sendErrorMessage(res, 404, "The user with the given id was not found.");
    });
});

module.exports = router;
