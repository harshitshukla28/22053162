require("dotenv").config();

const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes");
const controller = require("./controller");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
	cors({
		origin: "http://localhost:3000",
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", apiRoutes);

controller.fetchAndProcessAllData().catch((err) => {
	console.error("Initial data fetch failed:", err);
});

const refreshIntervalMinutes = 1;
setInterval(() => {
	console.log(`Triggering data refresh.`);
	controller.fetchAndProcessAllData().catch((err) => {
		console.error("Background data refresh failed:", err);
	});
}, refreshIntervalMinutes * 60 * 1000);

app.use((err, req, res, next) => {
	console.error("Unhandled Error:", err.stack || err);
	res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
	console.log(`Microservice listening on port ${PORT}`);
});
