const filterProyectIfValidToken = (project) => {
	let { id, description, name, created_at, default_branch, web_url, avatar_url } = project;
	return { id, description, name, created_at, default_branch, web_url, avatar_url };
};

const filterProyectIfInvalidToken = (project) => {
	let { id, description, name, created_at, default_branch, web_url, avatar_url } = project;
	return { id, description, name, created_at, default_branch, web_url, avatar_url };
};

const filterCommit = (commit) => {
	let { short_id, created_at, title, message, author_name, committer_name, web_url } = commit;
	return { short_id, created_at, title, message, author_name, committer_name, web_url };
};

const getUserProjectsGitlabURL = (username) => {
	return `https://gitlab.com/api/v4/users/${username}/projects`;
};

const getUserProjectsByIDGitlabURL = (projectid) => {
	return `https://gitlab.com/api/v4/projects/${projectid}`;
};

const getUserProjectCommitsByIDGitlabURL = (projectid) => {
	return `https://gitlab.com/api/v4/projects/${projectid}/repository/commits`;
};

module.exports = {
	filterProyectIfValidToken,
	filterProyectIfInvalidToken,
	getUserProjectsGitlabURL,
	getUserProjectsByIDGitlabURL,
	getUserProjectCommitsByIDGitlabURL,
	filterCommit
};
