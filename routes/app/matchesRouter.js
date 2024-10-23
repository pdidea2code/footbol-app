const express=require("express");
const router=express.Router();
const {MatchesDetails,Stats,Lineups,H2H}=require("../../controllers/App/matches");

router.post("/MatchesDetails",MatchesDetails);
router.post("/Stats",Stats);    
router.post("/Lineups",Lineups);
router.post("/H2H",H2H);
module.exports=router;
