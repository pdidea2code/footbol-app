const express = require("express");
const { teamImage, uniqueTournamentImage, countryFlag, playerImage } = require("../../controllers/App/image");

const routes = express.Router();

routes.get("/teamImage/:teamId", teamImage);
routes.get("/uniqueTournamentImage/:uniqueTournamentId", uniqueTournamentImage);
routes.get("/countryFlag/:flag", countryFlag);
routes.get("/playerImage/:playerId", playerImage);

module.exports = routes;
