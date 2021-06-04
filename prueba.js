const Joi = require("joi");
const axios = require("axios");

const validateUser = Organization => {
  const schema = Joi.object({
    name: Joi.string().required(),
    logo: Joi.string().required(),
    task_status: Joi.array().items(Joi.string()).required(),
    schedule: Joi.array().items(Joi.string().valid("Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat")).required(),
  });

  return schema.validate(Organization, { allowUnknown: true });
};

function testGitlabToken(gitlab_username, token, success, fail) {
  axios
    .get(`https://gitlab.com/api/v4/users/${gitlab_username}/projects`, {
      headers: {
        "PRIVATE-TOKEN": token,
      },
    })
    .then(response => {
      if (response) {
        if (success) success(response.data);
      }
    })
    .catch(error => {
      let res = error.response.data.error;
      if (fail) fail(res === undefined ? error.response.data.message : res);
    });
}

const filterUser = User => {
  let { _id, username, nickname, firstName, lastName, avatar } = User;
  return { _id, username, nickname, firstName, lastName, avatar };
};

// console.log(
// 	filterUser({
// 		username: 'wefwef',
// 		nickname: 'fwe',
// 		firstName: 'qwfgw',
// 		lastName: 'efwegw',
// 		avatar: 'wefweg'
// 	})
// );

/*
testGitlabToken(
	'jj.penad',
	'znAd3TzUbyWwBuABz-MP',
	(response) => {
		console.log(response);
	},
	(error) => {
		console.log('Mal:', error);
	}
);


console.log(
	validateUser({
		name: 'uhoj',
		logo: 'efuwoe',
		task_status: [ 'Done' ],
		schedule: [],
		hola: 'wefwef'
	})
);
*/
