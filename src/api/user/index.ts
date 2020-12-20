import db from "../../db";
import auth from "../../utils/auth";

const userIndex = async (req, res) => {
	const authenticatedUser = await auth(req);
	if (!authenticatedUser)
		return res.status(401).json({ err: "badAuthorization" });

	const fetchedUser = await db.User.findOne({
		where: {
			id: authenticatedUser.id,
		},
		include: [db.Device, db.UserPushSubscription],
	});

	if (!fetchedUser) return res.status(404).json({ err: "missingResource" });

	return res.status(200).json(fetchedUser);
};

export default userIndex;
