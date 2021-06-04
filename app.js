var dotenv = require("dotenv");
/*
 * Configure Environment Variables
 */
dotenv.config();
var express = require("express");
var path = require("path");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const jwt = require("express-jwt");
const jwtAuthz = require("express-jwt-authz");
const jwksRsa = require("jwks-rsa");

// Authorization middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
const checkJwt = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://brisk-app.us.auth0.com/.well-known/jwks.json`,
  }),

  // Validate the audience and the issuer.
  // audience: "https://brisk-server",
  // issuer: [`https://brisk-app.us.auth0.com/`],
  algorithms: ["RS256"],
});

// var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var orgRouter = require("./routes/organizations");
var gitlabRouter = require("./routes/gitlab");
var tasksRouter = require("./routes/clickup");

var app = express();

app.use(checkJwt);
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/orgs", orgRouter);
app.use("/api/gitlab", gitlabRouter);
app.use("/api/tasks", tasksRouter);

module.exports = app;
