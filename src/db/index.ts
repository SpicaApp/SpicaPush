const Sequelize = require("sequelize");
require("dotenv").config();
import device from "./Device";
import pushSubscription from "./UserPushSubscription";
import user from "./User";

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

export default db;

device(db);
pushSubscription(db);
user(db);

db.sync();
