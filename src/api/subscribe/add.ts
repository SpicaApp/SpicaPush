import db from "../../db";
import auth from "../../utils/auth";
import { v4 as uuidv4 } from "uuid";

const addSubscription = async (req, res) => {
	if (typeof req.body.uid !== "string")
		return res.status(400).json({ err: "badRequest" });
	const authenticatedUser = await auth(req);
	if (!authenticatedUser)
		return res.status(401).json({ err: "badAuthorization" });

	if (req.body.uid === authenticatedUser.id)
		return res.status(400).json({ err: "subscribe.self" });

	const existingUser = await db.User.findOne({
		where: {
			id: authenticatedUser.id,
		},
		include: [db.UserPushSubscription],
	});

	if (!existingUser) return res.status(404).json({ err: "missingResource" });

	const existingSubscription = await db.UserPushSubscription.findOne({
		where: {
			subscribedto: req.body.uid,
			userId: authenticatedUser.id,
		},
	});

	if (existingSubscription)
		return res.status(400).json({ err: "alreadySubscribed" });

	const newSubscription = await db.UserPushSubscription.create({
		id: uuidv4(),
		subscribedto: req.body.uid,
	});

	await existingUser.addUserpushsubscription(newSubscription);

	return res
		.status(200)
		.json({ user: existingUser, subscription: newSubscription });
};

export default addSubscription;
