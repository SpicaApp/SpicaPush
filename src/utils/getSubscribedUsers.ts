import db from "../db";

export const getSubscribedUsers = async (id): Promise<String[]> => {
	const allUsers = await db.UserPushSubscription.findAll({
		where: {
			subscribedto: id,
		},
	});

	var userIds: String[] = [];

	for (var i = 0; i < allUsers.length; i++) {
		userIds.push(allUsers[i].userId);
	}
	return userIds;
};
