const auth = require("../../utils/auth");
const db = require("../../db");
const uuid = require("uuid").v4;

module.exports = async (req, res) => {
    if (typeof req.body.uid !== "string") return res.status(400).json({ err: "badRequest" });
    const authenticatedUser = await auth(req);
    if (!authenticatedUser) return res.status(401).json({ err: "badAuthorization" });

    if (req.body.uid === authenticatedUser.user) return res.status(400).json({ err: "subscribe.self"});

    const existingUser = await db.User.findOne({
        where: {
            id: authenticatedUser.user
        },
        include: [db.UserPushSubscription]
    });

    if (!existingUser) return res.status(404).json({ err: "missingResource" });

    const existingSubscription = await db.UserPushSubscription.findOne({
        where: {
            subscribedto: req.body.uid,
            userId: authenticatedUser.user
        }
    });

    if (existingSubscription) return res.status(400).json({ err: "alreadySubscribed" });

    const newSubscription = await db.UserPushSubscription.create({
        id: uuid(),
        subscribedto: req.body.uid
    });

    await existingUser.addUserpushsubscription(newSubscription);

    return res.status(200).json({ user: existingUser, subscription: newSubscription});
}