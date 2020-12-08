require("dotenv").config();
const express = require("express");
const add = require("./api/subscribe/add");
const app = express();
const db = require("./db");

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
		version: "ĀÃÂÆàÆäÀåæAäâĀæÂÁÂÆÁ",
	});
});

app.post("/device/create", require("./api/device/create"));
app.delete("/device/delete", require("./api/device/delete"));
app.post("/post/send", require("./api/post/send"));
app.get("/user", require("./api/user"));
app.post("/user/update", require("./api/user/update"));
app.post("/user/revokeall", require("./api/user/revokeAllDevices"));
app.delete("/user/delete", require("./api/user/delete"));
app.get("/subscriptions", require("./api/subscribe"));
app.post("/subscriptions", require("./api/subscribe/add"));
app.delete("/subscriptions", require("./api/subscribe/remove"));

// 404
app.use((req, res) => {
	res.status(404).json({ err: "notFound" });
});
