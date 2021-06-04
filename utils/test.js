const axios = require('axios');

function testGitlabToken(gitlab_username, token, success, fail) {
	axios
		.get(`https://gitlab.com/api/v4/users/${gitlab_username}/projects`, {
			headers: {
				'PRIVATE-TOKEN': token
			}
		})
		.then((response) => {
			if (response) {
				if (success) success(response.data);
			}
		})
		.catch((error) => {
			let res = error.response.data.error;
			if (fail) fail(res === undefined ? error.response.data.message : res);
		});
}

module.exports = { testGitlabToken };
