const getTeams = () =>{
    return `https://api.clickup.com/api/v2/team`;
}

const getTeamById = (teamid) =>{
    return `https://api.clickup.com/api/v2/team/${teamid}`;
}

const getSpaces = (teamid) =>{
    return `https://api.clickup.com/api/v2/team/${teamid}/space?archived=false`;
}

const getFolders = (spaceid) =>{
    return `https://api.clickup.com/api/v2/space/${spaceid}/folder?archived=false`;
}

const getLists = (folderid) =>{
    return `https://api.clickup.com/api/v2/folder/${folderid}/list?archived=false`;
}

const getTasks = (listid) =>{
    return `https://api.clickup.com/api/v2/list/${listid}/task?archived=false`;
}
const updateTask = (taskid) => {
    return `https://api.clickup.com/api/v2/task/${taskid}`;
}

module.exports = {
	getTeams,
    getTeamById,
    getSpaces,  
    getFolders,
    getLists,
    getTasks,
    updateTask
};