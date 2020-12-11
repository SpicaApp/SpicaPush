import db from "../db";
const apn = require("apn");

var apnProvider;

var apnOptions = {
	token: {
		key: process.env.APN_TOKEN.replace(/\\n/g, "\n"),
		keyId: process.env.APN_KEY_ID,
		teamId: process.env.APN_TEAM_ID,
	},
	//production: true,
};

apnProvider = new apn.Provider(apnOptions);

export const sendNotification = async (notification: Notification) => {
	const results = [];

	for (var uid of notification.uids) {
		const user = await db.User.findOne({
			where: {
				id: uid,
			},
			include: [db.Device],
		});

		if (user && isAllowedToSendNotification(notification, user)) {
			const userDeviceIds = user.devices.map((device) => device.pushtoken);
			const apnnotification = new apn.Notification({
				badge: 1,
				sound: "ping.aiff",
				title: notification.title,
				body: notification.message,
				payload: notification.payload,
				topic: "dev.abmgrt.spica",
				threadId: notification.type.toString(),
			});

			const apnResult = await apnProvider.send(apnnotification, userDeviceIds);

			results.push(apnResult);
		}
	}

	return { success: results };
};

function isAllowedToSendNotification(
	notification: Notification,
	user: any
): Boolean {
	if (!user.notificationsEnabled) return false;
	if (notification.type === NotificationType.REPLY && user.repliesEnabled)
		return true;
	if (notification.type === NotificationType.MENTION && user.mentionsEnabled)
		return true;
	if (notification.type === NotificationType.SUBSCRIPTION) return true;
	return false;
}

export interface Notification {
	title: String;
	message: String;
	payload: any;
	uids: String[];
	type: NotificationType;
}

export enum NotificationType {
	MENTION = "mention",
	REPLY = "reply",
	SUBSCRIPTION = "subscription",
}
