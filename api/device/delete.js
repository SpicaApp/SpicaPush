const db = require("../../db");
const auth = require("../../utils/auth");

module.exports = async (req, res) => {
    if (!Array.isArray(req.body.devices)) return res.status(400).json({ err: "badRequest" });
    const authenticatedUser = await auth(req);
    if (!authenticatedUser) return res.status(401).json({ err: "badAuthorization" });    

    const failedDevices = [];
    const deletedDevices = []

    for (var i = 0; i < req.body.devices.length; i++) {
        const device = await db.Device.findOne({
            where: {
                id: req.body.devices[i],
                '$user.id$': authenticatedUser.user
            },
            include: [
                {model: db.User}
            ]
        });

        if (!device) {
            failedDevices.push(req.body.devices[i])
        }
        else {
            await device.destroy();
            deletedDevices.push(req.body.devices[i])
        }
    }
    
    return res.status(200).json({ success: deletedDevices, failed: failedDevices });
}