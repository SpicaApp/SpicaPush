const { DataTypes } = require("sequelize");

const pushSubscription = (db) => {
	db.UserPushSubscription = db.define(
		"userpushsubscription",
		{
			id: {
				primaryKey: true,
				type: DataTypes.UUID,
				allowNull: false,
			},
			subscribedto: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			paranoid: false,
			updatedAt: false,
		}
	);
};

export default pushSubscription;
