const db = require("../db");

module.exports = async (id) => {
    const allUsers = await db.UserPushSubscription.findAll({
        where: {
            subscribedto: id
        }
    });

    console.log(allUsers);

    var userIds = [];

    for (var i = 0; i < allUsers.length; i++) {
        console.log(allUsers[i]);
        userIds.push(allUsers[i].userId);
    }
    return userIds;
}