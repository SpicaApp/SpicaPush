const db = require("../db");
const apn = require("apn");

var apnProvider;

var apnOptions = {
    token: {
        key: process.env.APN_TOKEN.replace(/\\n/g, "\n"),
        keyId: process.env.APN_KEY_ID,
        teamId: process.env.APN_TEAM_ID,
    },
    production: true,
};

apnProvider = new apn.Provider(apnOptions);

module.exports = async (title, message, payload, uids, type) => {
    if (typeof title !== "string" || typeof message !== "string" || !Array.isArray(uids) || (type !== "reply" && type !== "mention" && type !== "subscription")) return { err: "badRequest" };

    const results = [];

    for (var i = 0; i < uids.length; i++) {


        const user = await db.User.findOne({
            where: {
                id: uids[i]
            },
            include: [db.Device]
        });

        if (user && user.notificationsEnabled) {
            if ((type === "reply" && user.repliesEnabled) || (type === "mention" && user.mentionsEnabled) || type == "subscription") {
                const deviceIds = user.devices.map(device => device.pushtoken);

                const notification = new apn.Notification({
                    badge: 1,
                    sound: "ping.aiff",
                    title: title,
                    body: message,
                    payload: payload,
                    topic: "dev.abmgrt.spica",
                    threadId: type
                });

                const apnResult = await apnProvider.send(notification, deviceIds);
                
                results.push(apnResult);
            }
        }

        /*const devices = await db.Device.findAll({
            where: {
                '$user.id$': uids[i]
            },
            include: [
                {model: db.User}
            ]
        });*/


        //return { success: apnResult }

    }

    return { success: results };
}