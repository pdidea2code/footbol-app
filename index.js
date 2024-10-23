const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const cors = require("cors");
const path = require("path");
// const cron = require("node-cron");
require("dotenv").config();
const mongoose = require("mongoose");
const PORT = process.env.PORT;
const errorController = require("./helper/errorController");

app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Db connected");
  })
  .catch((error) => {
    console.log(error);
  });
// cron.schedule("*/1 * * * *", async () => {
//   console.log("Cron job executed at 12 PM.");
//   console.log("Cron job executed at:", new Date().toLocaleString());
// });

// app.use((req, res, next) => {
//   const currentTime = new Date().toISOString();
//   console.log(`[${currentTime}] ${req.method} ${req.url} - IP: ${req.ip}`);
//   next();
// });

const apps = require("./routes/app");
app.use(apps);

// const admin = require("./routes/admin");
// app.use(admin);

app.use(errorController);

// app.use((err, req, res, next) => {
//   console.error("Error log:", err);
//   if (err.code && err.code === 11000) {
//     err.message = `Duplicate key error: ${Object.keys(err.keyValue)[0]} with value '${
//       Object.values(err.keyValue)[0]
//     }' already exists.`;
//   }

//   res.status(err.status || 500).json({
//     status: err.status || 500,
//     success: false,
//     message: err.message || "An unexpected error occurred.",
//   });
// });

// app.use(express.static(path.join(__dirname, "./client/build")));
// app.get("/*", async function (req, res) {
//   await res.sendFile(path.join(__dirname, "./client/build", "index.html"));
// });

// app.use("/profileimg", express.static(path.join(__dirname, "./public/profileimg")));
// app.use("/announcementimg", express.static(path.join(__dirname, "./public/announcementimg")));
// app.use("/announcementimg", express.static(path.join(__dirname, "./public/announcementimg")));

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
