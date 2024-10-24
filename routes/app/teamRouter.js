const express = require("express");
const { Overview } = require("../../controllers/App/team");

const routes = express.Router();

routes.post("/overview", Overview);

module.exports = routes;
