const { DataTypes } = require("sequelize");

module.exports = (db) => {
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
		},
		{
			paranoid: false,
			updatedAt: false,
		}
	);
};
