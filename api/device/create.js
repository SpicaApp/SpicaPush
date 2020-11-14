const auth = require("../../utils/auth");
const db = require("../../db");
const uuid = require("uuid").v4;

module.exports = async (req, res) => {
    if (typeof req.body.name !== "string" || typeof req.body.uid !== "string" || typeof req.body.token !== "string" || typeof req.body.type !== "string") return res.status(400).json({ err: "badRequest" });
    const authenticatedUser = await auth(req);
    if (!authenticatedUser || authenticatedUser.user !== req.body.uid) return res.status(401).json({ err: "badAuthorization" });

    var existingUser = await db.User.findOne({
        where: {
            id: req.body.uid
        }
    });


    const existingDevice = await db.Device.findOne({
        where: {
            pushtoken: req.body.token
        }
    });

    if (existingDevice) return res.status(400).json({ err: "deviceTokenAlreadyExists" });

    if (!existingUser) {
        existingUser = await db.User.create({
            id: req.body.uid,
        });
    }

    const newDevice = await db.Device.create({
        id: uuid(),
        name: req.body.name,
        pushtoken: req.body.token,
        type: req.body.type
    });

    await existingUser.addDevice(newDevice);

    res.status(200).json(newDevice);
}