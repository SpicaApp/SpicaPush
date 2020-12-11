import db from "../../db";
import auth from "../../utils/auth";

const removeSubscription = async (req, res) => {
	if (typeof req.body.uid !== "string")
		return res.status(400).json({ err: "badRequest" });
	const authenticatedUser = await auth(req);
	if (!authenticatedUser)
		return res.status(401).json({ err: "badAuthorization" });

	const subscription = await db.UserPushSubscription.findOne({
		where: {
			subscribedto: req.body.uid,
			userId: authenticatedUser.user,
		},
	});

	if (!subscription) return res.status(404).json({ err: "missingResource" });

	await subscription.destroy();

	return res.status(200).json({});
};

export default removeSubscription;
