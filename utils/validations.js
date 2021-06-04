const Joi = require("joi");

const validateGitlab = Gitlab => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    gitlab_username: Joi.string().required(),
    token: Joi.string().required(),
  });

  return schema.validate(Gitlab, { allowUnknown: false });
};

const validateUserCreate = User => {
  const schema = Joi.object({
    uid: Joi.string().required(),
    email: Joi.string().email().required(),
    nickname: Joi.string(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    avatar: Joi.string().uri(),
    logins: Joi.number(),
  });

  return schema.validate(User);
};

const validateUserUpdate = User => {
  const schema = Joi.object({
    uid: Joi.string().required(),
    email: Joi.string().email(),
    nickname: Joi.string(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    avatar: Joi.string().uri(),
    logins: Joi.number(),
  });

  return schema.validate(User);
};

const validateOrg = Organization => {
  const schema = Joi.object({
    name: Joi.string().required(),
    logo: Joi.string().required(),
    userForDaily: Joi.string(),
    task_status: Joi.array().items(Joi.string()).required(),
    schedule: Joi.array()
      .max(7)
      .items(Joi.string().valid("Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"))
      .required(),
  });

  return schema.validate(Organization, { allowUnknown: false });
};

module.exports = { validateUserCreate, validateUserUpdate, validateGitlab, validateOrg };
