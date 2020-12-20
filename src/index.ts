import db from "./db";
import send from "./api/post/send";
import createDevice from "./api/device/create";
import deleteDevice from "./api/device/delete";
import userIndex from "./api/user";
import updateUser from "./api/user/update";
import revokeAllDevices from "./api/user/revokeAllDevices";
import deleteUser from "./api/user/delete";
import subscriptionIndex from "./api/subscribe";
import addSubscription from "./api/subscribe/add";
import removeSubscription from "./api/subscribe/remove";

require("dotenv").config();
import * as express from "express";
const app = express();
var admin = require("firebase-admin");

if (process.env.FIREBASE_JSON && process.env.FIREBASE_DB) {
	admin.initializeApp({
		credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_JSON)),
		databaseURL: process.env.FIREBASE_DB,
	});
}

app.use(require("body-parser").json({ limit: "50mb" }));
app.use((err, req, res, next) => {
	console.log(err);
	res.status(500).json({ err: "internalError" });
});
app.listen(process.env.PORT || 8080, () =>
	console.log("Spica Push Server started and active.")
);

app.get("/", (req, res) => {
	res.send({
		name: "Spica Push server",
		repo: "https://github.com/SpicaApp/SpicaPush",
		version: "another one",
	});
});

app.post("/device/create", createDevice);
app.delete("/device/delete", deleteDevice);
app.post("/post/send", send);
app.get("/user", userIndex);
app.post("/user/update", updateUser);
app.post("/user/revokeall", revokeAllDevices);
app.delete("/user/delete", deleteUser);
app.get("/subscriptions", subscriptionIndex);
app.post("/subscriptions", addSubscription);
app.delete("/subscriptions", removeSubscription);

// 404
app.use((req, res) => {
	res.status(404).json({ err: "notFound" });
});

export default app;
