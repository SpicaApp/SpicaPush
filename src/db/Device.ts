const { DataTypes } = require("sequelize");

const device = (db) => {
	db.Device = db.define(
		"device",
		{
			id: {
				primaryKey: true,
				type: DataTypes.UUID,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			pushtoken: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			os: {
				type: DataTypes.ENUM("ios", "android"),
				allowNull: false,
			},
		},
		{
			paranoid: false,
			updatedAt: false,
		}
	);
};

export default device;
