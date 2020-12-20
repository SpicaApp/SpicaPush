const axios = require("axios").default;

const auth = async (req) => {
	if (!req.headers.authorization) return;
	try {
		const sessionRequest = await axios.get("https://micro.alles.cx/api/me", {
			headers: {
				Authorization: req.headers.authorization,
			},
		});
		return sessionRequest.data;
	} catch (err) {
		console.log(err);
		return;
	}
};

export default auth;
