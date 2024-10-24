const express = require("express");
const { NextMatch } = require("../../controllers/App/team");

const routes = express.Router();

routes.post("/NextMatch", NextMatch);

module.exports = routes;
