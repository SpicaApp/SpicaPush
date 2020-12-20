import { v4 as uuidv4 } from "uuid";
import db from "../../db";
import auth from "../../utils/auth";

const createDevice = async (req, res) => {
	if (
		typeof req.body.name !== "string" ||
		typeof req.body.uid !== "string" ||
		typeof req.body.token !== "string" ||
		typeof req.body.type !== "string"
	)
		return res.status(400).json({ err: "badRequest" });

	const authenticatedUser = await auth(req);

	if (!authenticatedUser || authenticatedUser.user !== req.body.uid)
		return res.status(401).json({ err: "badAuthorization" });

	var existingUser = await db.User.findOne({
		where: {
			id: req.body.uid,
		},
	});

	const existingDevice = await db.Device.findOne({
		where: {
			pushtoken: req.body.token,
			os: req.body.os ?? "ios",
		},
	});

	if (existingDevice) {
		existingDevice.type = req.body.type;
		existingDevice.name = req.body.name;
		await existingDevice.save();
		return res.status(200).json(existingDevice);
	} else {
		if (!existingUser) {
			existingUser = await db.User.create({
				id: req.body.uid,
			});
		}

		const newDevice = await db.Device.create({
			id: uuidv4(),
			name: req.body.name,
			pushtoken: req.body.token,
			type: req.body.type,
			os: req.body.os ?? "ios",
		});

		await existingUser.addDevice(newDevice);

		return res.status(200).json(newDevice);
	}
	//return res.status(400).json({ err: "deviceTokenAlreadyExists" });
};

export default createDevice;
