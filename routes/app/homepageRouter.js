const express = require("express");
const { LiveMatch, UpcomingMatch, CompleteMatch, Search } = require("../../controllers/App/homepage");

const routes = express.Router();

routes.get("/LiveMatch", LiveMatch);
routes.post("/UpcomingMatch", UpcomingMatch);
routes.post("/CompleteMatch", CompleteMatch);
routes.post("/Search", Search);

module.exports = routes;
