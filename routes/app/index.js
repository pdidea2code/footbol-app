const express = require("express");
const routes = express.Router();
const homepageRouter = require("./homepageRouter");
const imageRouter = require("./imageRouter");
const leagueRouter = require("./leagueRouter");
const matchesRouter = require("./matchesRouter");

routes.use("/app/home", homepageRouter);
routes.use("/app/image", imageRouter);
routes.use("/app/league", leagueRouter);
routes.use("/app/matches", matchesRouter);
module.exports = routes;
