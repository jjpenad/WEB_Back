const express = require("express");
const router = express.Router();
const axios = require("axios");
const {
  getTeams,
  getTeamById,
  getSpaces,
  getFolders,
  getLists,
  getTasks
} = require("../utils/clickup");

router.get("/team", function (req, res) {
  let item = { token: "invalid", team: {} };
  axios.get(getTeams(), {
    headers: {
      "Authorization": req.headers.token || ""
    },
  }).then(response => {
    if (response) {
      item.token = "valid";
      item.team = response.data
    }
    res.send(item);
  }).catch(error => {
    console.log("ERROR WHILE FETCHING THE TEAM ", error);
  }
  );
});

router.get("/team/:teamid", function (req, res) {
  let item = {};
  axios.get(getTeamById(req.params.teamid), {
    headers: {
      "Authorization": req.headers.token || ""
    },
  }).then(response => {
    if (response) {
      item = response.data
    }
    res.send(item);
  }).catch(error => {
    console.log("ERROR WHILE FETCHING THE TEAM BY ID ", error);
  }
  );
});

router.get("/team/:teamid/spaces/", function (req, res) {
  let item = {};
  axios.get(getSpaces(req.params.teamid), {
    headers: {
      "Authorization": req.headers.token || ""
    },
  }).then(response => {
    if (response) {
      item = response.data
    }
    res.send(item);
  }).catch(error => {
    console.log("ERROR WHILE FETCHING THE SPACES ", error);
  }
  );
});


router.get("/team/:teamid/spaces/:spaceid/folders", function (req, res) {
  let item = {};
  axios.get(getFolders(req.params.spaceid), {
    headers: {
      "Authorization": req.headers.token || ""
    },
  }).then(response => {
    if (response) {
      item = response.data
    }
    res.send(item);
  }).catch(error => {
    console.log("ERROR WHILE FETCHING THE FOLDERS ", error);
  }
  );
});

router.get("/team/:teamid/spaces/:spaceid/folders/:folderid/lists", function (req, res) {
  let item = {};
  axios.get(getLists(req.params.folderid), {
    headers: {
      "Authorization": req.headers.token || ""
    },
  }).then(response => {
    if (response) {
      item = response.data
    }
    res.send(item);
  }).catch(error => {
    console.log("ERROR WHILE FETCHING THE LISTS ", error);
  }
  );
});

router.get("/team/:teamid/spaces/:spaceid/folders/:folderid/lists/:listid/tasks", function (req, res) {
  let item = {};
  axios.get(getTasks(req.params.listid), {
    headers: {
      "Authorization": req.headers.token || ""
    },
  }).then(response => {
    if (response) {
      item = response.data
    }
    res.send(item);
  }).catch(error => {
    console.log("ERROR WHILE FETCHING THE TASKS ", error);
  }
  );
});

module.exports = router;