const express = require("express");
const { LiveMatch, UpcomingMatch, CompleteMatch, Search, country, uniqueTournamentbyCountry } = require("../../controllers/App/homepage");

const routes = express.Router();

routes.get("/LiveMatch", LiveMatch);
routes.post("/UpcomingMatch", UpcomingMatch);
routes.post("/CompleteMatch", CompleteMatch);
routes.post("/Search", Search);
routes.get("/country", country);
routes.post("/uniqueTournamentbyCountry", uniqueTournamentbyCountry);
module.exports = routes;
