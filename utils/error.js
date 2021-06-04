const sendErrorMessage = (resObject, status, message) => {
	return resObject.status(status).send({ message });
};

module.exports = { sendErrorMessage };
