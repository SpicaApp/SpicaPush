import db from "../../db";
import auth from "../../utils/auth";

const updateUser = async (req, res) => {
	const authenticatedUser = await auth(req);
	if (!authenticatedUser)
		return res.status(401).json({ err: "badAuthorization" });
	if (
		typeof req.body.notificationsEnabled !== "boolean" ||
		typeof req.body.repliesEnabled !== "boolean" ||
		typeof req.body.mentionsEnabled !== "boolean"
	)
		return res.status(400).json({ err: "badRequest" });

	const user = await db.User.findOne({
		where: {
			id: authenticatedUser.user,
		},
		include: [db.Device],
	});

	if (!user) return res.status(404).json({ err: "missingResource" });

	user.notificationsEnabled = req.body.notificationsEnabled;
	user.repliesEnabled = req.body.repliesEnabled;
	user.mentionsEnabled = req.body.mentionsEnabled;

	await user.save();

	return res.status(200).json(user);
};

export default updateUser;
