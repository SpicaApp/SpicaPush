const db = require("../db");

module.exports = async (id) => {
    const allUsers = await db.UserPushSubscription.findAll({
        where: {
            subscribedto: id
        }
    });

    var userIds = [];

    for (var i = 0; i < allUsers.length; i++) {
        userIds.push(allUsers[i].userId);
    }
    return userIds;
}