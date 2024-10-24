const axios = require("axios");
const { successResponse } = require("../../helper/sendResponse");

const Overview = async (req, res, next) => {
  try {
    let nextMatch = null;
    try {
    const { data,headers } = await axios.get(`${process.env.WEB_API_URL}/api/v1/team/${req.body.teamid}/events/next/0`, {
        headers: {
          "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
        }
      });
      nextMatch = data.events[0];
    } catch (error) {
      console.error("Error fetching Next Match:", error);
    }

      const nextEvent = {
        id: nextMatch.id,
        name: nextMatch.name,
        startDate: nextMatch.startDate,
        homeTeam: nextMatch.homeTeam.name,
        homeTeamId: nextMatch.homeTeam.id,
        homeTeamShortName: nextMatch.homeTeam.shortName,
        homeTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${nextMatch.homeTeam.id}`,
        awayTeam: nextMatch.awayTeam.name,
        awayTeamId: nextMatch.awayTeam.id,
        awayTeamShortName: nextMatch.awayTeam.shortName,
        awayTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${nextMatch.awayTeam.id}`,
        league: nextMatch.league,
        uniqueTournament: nextMatch.uniqueTournament,
        type: nextMatch.type,
        season: nextMatch.season.id,
        }

        let lastMatch = null;
        try{
          const { data,headers } = await axios.get(`${process.env.WEB_API_URL}/api/v1/team/${req.body.teamid}/events/last/1`, {
            headers: {
              "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
              "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
            }
          });
          lastMatch = data.events;
        }catch(error){
          console.error("Error fetching Last Match:", error);
        }





const info={
  NextMatch: nextEvent,
  LastMatch: lastMatch,
}
    successResponse(res, info);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  Overview,
};
