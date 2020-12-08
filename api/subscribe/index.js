const auth = require("../../utils/auth");
const db = require("../../db");
const uuid = require("uuid").v4;

module.exports = async (req, res) => {
	const authenticatedUser = await auth(req);
	if (!authenticatedUser)
		return res.status(401).json({ err: "badAuthorization" });

	var existingUser = await db.User.findOne({
		where: {
			id: authenticatedUser.user,
		},
		include: [db.UserPushSubscription],
	});

	if (!existingUser) return res.status(404).json({ err: "missingResource" });

	return res.status(200).json(existingUser);
};
