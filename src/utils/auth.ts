const axios = require("axios").default;

const auth = async (req) => {
	if (!req.headers.authorization) return;
	try {
		const sessionRequest = await axios.post("https://micro.alles.cx/api/me", {
			token: req.headers.authorization,
		});
		return sessionRequest.data;
	} catch (err) {
		return;
	}
};

export default auth;
