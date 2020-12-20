import { v4 as uuidv4 } from "uuid";
import db from "../../db";
import auth from "../../utils/auth";

const deleteDevice = async (req, res) => {
	if (!Array.isArray(req.body.devices))
		return res.status(400).json({ err: "badRequest" });
	const authenticatedUser = await auth(req);
	if (!authenticatedUser)
		return res.status(401).json({ err: "badAuthorization" });

	const failedDevices = [];
	const deletedDevices = [];

	for (var device of req.body.devices) {
		const foundDevice = await db.Device.findOne({
			where: {
				id: device,
				"$user.id$": authenticatedUser.id,
			},
			include: [{ model: db.User }],
		});

		if (!foundDevice) {
			failedDevices.push(device);
		} else {
			await foundDevice.destroy();
			deletedDevices.push(device);
		}
	}

	return res
		.status(200)
		.json({ success: deletedDevices, failed: failedDevices });
};

export default deleteDevice;
