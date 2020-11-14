const db = require("../../db")
const auth = require("../../utils/auth")

module.exports = async (req, res) => {
    const authenticatedUser = await auth(req);
    if (!authenticatedUser) return res.status(401).json({ err: "badAuthorization" });

    const user = await db.User.findOne({
        where: {
            id: authenticatedUser.user
        },
        include: [db.Device]
    });

    if (!user) return res.status(404).json({ err: "missingResource" });

    for (var i = 0; i < user.devices.length; i++) {
        await user.devices[i].destroy();
    }

    return res.status(200).json({});
}