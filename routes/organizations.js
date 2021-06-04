var express = require("express");
var router = express.Router();
const Joi = require("joi");
const { sendErrorMessage } = require("../utils/error");
const { validateOrg } = require("../utils/validations");

const Organization = require("../controller/organization");
const User = require("../controller/user");

router.get("/", function (req, res, next) {
  Organization.findAll().then(result => {
    res.send(result);
  });
});

router.get("/:id", function (req, res, next) {
  Organization.findOne(req.params.id)
    .then(result => {
      if (result === null) return sendErrorMessage(res, 404, "The organization with the given id was not found.");
      res.send(result);
    })
    .catch(err => {
      sendErrorMessage(res, 404, "The organization with the given id was not found.");
    });
});

// NEW
router.get("/:id/members", function (req, res, next) {
  Organization.findOne(req.params.id)
    .then(result => {
      if (result === null) return sendErrorMessage(res, 404, "The organization with the given id was not found.");

      User.findAllByOrg(req.params.id).then(result => {
        res.send(result);
      });
    })
    .catch(err => {
      sendErrorMessage(res, 404, "The organization with the given id was not found.");
    });
});

router.post("/", function (req, res, next) {
  const { error } = validateOrg(req.body);

  if (error) return sendErrorMessage(res, 400, error.details[0].message);

  const { name, logo, userForDaily, task_status, schedule } = req.body;

  if (userForDaily) {
    User.findOne(userForDaily)
      .then(result => {
        if (result === null) return sendErrorMessage(res, 404, "The user set for daily stand-up was not found.");

        Organization.insertOne({ name, logo, userForDaily, task_status, schedule })
          .then(resu => {
            res.send(resu.ops[0]);
          })
          .catch(error => {
            sendErrorMessage(res, 404, "Error inserting the organization.");
          });
      })
      .catch(err => {
        sendErrorMessage(res, 404, "The user set for daily stand-up was not found.");
      });
  } else {
    Organization.insertOne({ name, logo, userForDaily, task_status, schedule })
      .then(resu => {
        res.send(resu.ops[0]);
      })
      .catch(error => {
        sendErrorMessage(res, 404, "Error inserting the organization.");
      });
  }
});

router.put("/:id", function (req, res, next) {
  const { error } = validateOrg(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { name, logo, userForDaily, task_status, schedule } = req.body;

  if (userForDaily) {
    User.findOne(userForDaily)
      .then(result => {
        if (result === null) return sendErrorMessage(res, 404, "The user set for daily stand-up was not found.");

        Organization.replaceOne(req.params.id, { name, logo, userForDaily, task_status, schedule })
          .then(result => {
            if (result.modifiedCount === 0)
              return sendErrorMessage(res, 404, "The organization with the given id was not found.");
            res.send(result.ops[0]);
          })
          .catch(err => {
            sendErrorMessage(res, 404, "The organization with the given id was not found.");
          });
      })
      .catch(err => {
        sendErrorMessage(res, 404, "The user set for daily stand-up was not found.");
      });
  } else {
    Organization.replaceOne(req.params.id, { name, logo, userForDaily, task_status, schedule })
      .then(result => {
        if (result.modifiedCount === 0)
          return sendErrorMessage(res, 404, "The organization with the given id was not found.");
        res.send(result.ops[0]);
      })
      .catch(err => {
        sendErrorMessage(res, 404, "The organization with the given id was not found.");
      });
  }
});

router.delete("/:id", function (req, res, next) {
  Organization.deleteOne(req.params.id)
    .then(result => {
      if (result.deletedCount === 0)
        return sendErrorMessage(res, 404, "The organization with the given id was not found.");
      res.status(204).send();
    })
    .catch(err => {
      sendErrorMessage(res, 404, "The organization with the given id was not found.");
    });
});

module.exports = router;
