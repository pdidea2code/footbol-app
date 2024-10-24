const axios = require("axios");
const { successResponse } = require("../../helper/sendResponse");

const Overview = async (req, res, next) => {
  try {
    let nextMatch = null;
    try {
      const { data, headers } = await axios.get(
        `${process.env.WEB_API_URL}/api/v1/team/${req.body.teamid}/events/next/0`,
        {
          headers: {
            "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
            "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
          },
        }
      );
      nextMatch = data.events[0];
    } catch (error) {
      console.error("Error fetching Next Match:", error);
    }

    const nextEvent = nextMatch
      ? {
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
      : null;

    let lastMatches = [];
    try {
      const { data, headers } = await axios.get(
        `${process.env.WEB_API_URL}/api/v1/team/${req.body.teamid}/events/last/1`,
        {
          headers: {
            "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
            "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
          },
        }
      );
      console.log(data.events);
      lastMatches = data.events.slice(0, 5).map((match) => ({
        id: match.id,
        name: match.name,
        startDate: match.startDate,
        homeTeam: match.homeTeam.name,
        homeTeamId: match.homeTeam.id,
        homeTeamScore: match.homeScore.display,
        homeTeamShortName: match.homeTeam.shortName,
        homeTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${match.homeTeam.id}`,
        awayTeam: match.awayTeam.name,
        awayTeamId: match.awayTeam.id,
        awayTeamScore: match.awayScore.display,
        awayTeamShortName: match.awayTeam.shortName,
        awayTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${match.awayTeam.id}`,
        league: match.league,
        uniqueTournament: match.uniqueTournament,
        type: match.type,
        season: match.season.id,
      }));
    } catch (error) {
      console.error("Error fetching Last Match:", error);
    }

    const info = {
      NextMatch: nextEvent,
      LastMatch: lastMatches,
    };
    successResponse(res, info);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  Overview,
};
