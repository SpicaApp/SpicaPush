const Sequelize = require("sequelize");
require("dotenv").config();

const db = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USERNAME,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: "mariadb",
		dialectOptions: {
			timezone: "Etc/GMT0",
		},
		logging: false,
	}
);

module.exports = db;

require("./Device")(db);
require("./UserPushSubscription")(db);
require("./User")(db);

db.sync();