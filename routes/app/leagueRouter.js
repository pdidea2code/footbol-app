const express = require("express"); 
const router = express.Router();
const { Matches, Table, TopPlayers, TopTeam, Knockout } = require("../../controllers/App/league");

router.post("/Matches", Matches);
router.post("/Table", Table);
router.post("/TopPlayers", TopPlayers);
router.post("/TopTeam", TopTeam);
router.post("/Knockout", Knockout);
module.exports = router;
