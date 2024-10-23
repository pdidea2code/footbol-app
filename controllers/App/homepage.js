const axios = require("axios");
const { successResponse, queryErrorRelatedResponse } = require("../../helper/sendResponse");
require("dotenv").config();

const LiveMatch = async (req, res, next) => {
  try {
    if (!process.env.API_URL || !process.env.X_RAPIDAPI_KEY || !process.env.X_RAPIDAPI_HOST) {
      throw new Error("Missing required environment variables");
    }

    const { data, headers } = await axios.get(`${process.env.WEB_API_URL}/api/v1/sport/football/events/live`, {
      headers: {
        "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
      },
    });

    const info = data.events.map((data) => {
      const info = {
        eventid: data.id,
        name: data.tournament.name,
        leagueId: data.tournament.id,
        uniqueTournament: data.tournament.uniqueTournament?.name,
        uniqueTournamentId: data.tournament.uniqueTournament?.id,
        uniqueTournamentColor: data.tournament.uniqueTournament?.primaryColorHex,
        color: data.homeTeam.teamColors.primary,
        uniqueTournamentImage: data.tournament.uniqueTournament
          ? `${
              req.protocol +
              "://" +
              req.get("host") +
              process.env.LOCAL_UNIQUETOURNAMENTIMAGE +
              data.tournament.uniqueTournament?.id
            }`
          : null,
        country: data.tournament.category.country.name && data.tournament.category.country,

        countryImage:
          data.tournament.category.country.alpha2 &&
          `${
            req.protocol +
            "://" +
            req.get("host") +
            process.env.LOCAL_COUNTRYFLAG +
            data.tournament.category.country.alpha2
          }`,
        startTimestamp: data.startTimestamp,
        homeTeam: data.homeTeam.name,
        customId:data.customId,
        homeTeamImg: `${req.protocol + "://" + req.get("host") + process.env.LOCAL_TEAM_IMAGE + data.homeTeam.id}`,
        homeTeamId: data.homeTeam.id,
        homeScore: data.homeScore.display,
        awayTeam: data.awayTeam.name,
        awayTeamImage: `${req.protocol + "://" + req.get("host") + process.env.LOCAL_TEAM_IMAGE + data.awayTeam.id}`,
        awayTeamId: data.awayTeam.id,
        awayScore: data.awayScore.display,
        status: data.status,
        seasonid:data.season?.id?data.season.id:null
      };
      return info;
    });
    successResponse(res, info);
  } catch (error) {
    console.error("Error fetching live matches:", error.message);
    next(error);
  }
};

const UpcomingMatch = async (req, res, next) => {
  try {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const date = req.body.date || `${yyyy}-${mm}-${dd}`;

    const { data } = await axios.get(`${process.env.WEB_API_URL}/api/v1/sport/football/scheduled-events/${date}`, {
      headers: {
        "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
      },
    });

    const events = data?.events || [];

    const groupedEvents = events.reduce((acc, event) => {
      if (event.status?.type === "finished") return acc;

      const league = event.tournament.name;
      if (!acc[league]) acc[league] = [];

      acc[league].push({
        eventId: event.id,
        league,
        country: event.tournament.category.country.name,
        leagueId: event.tournament.id,
        uniqueTournament: data.tournament?.uniqueTournament?.name,
        uniqueTournamentId: event.tournament?.uniqueTournament?.id,
        countryImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_COUNTRYFLAG}${
          event.tournament.category.alpha2 ? event.tournament.category.alpha2 : event.tournament.category.flag
        }`,
        customId:event.customId,
        startTimestamp: event.startTimestamp,
        homeTeam: event.homeTeam.name,
        homeTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${event.homeTeam.id}`,
        homeTeamId: event.homeTeam.id,
        awayTeam: event.awayTeam.name,
        awayTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${event.awayTeam.id}`,
        awayTeamId: event.awayTeam.id,
        status: event.status,
        season: event.season.id,
      });

      return acc;
    }, {});

    const firstTwoGroups = Object.fromEntries(
      Object.entries(groupedEvents).slice(0, 2)
    );

    return successResponse(res, firstTwoGroups);
  } catch (error) {
    console.error("Error fetching upcoming matches:", error.message);
    next(error);
  }
};

const CompleteMatch = async (req, res, next) => {
  try {
    const date = req.body.date || `${yyyy}-${mm}-${dd}`;
    const { data } = await axios.get(`${process.env.WEB_API_URL}/api/v1/sport/football/scheduled-events/${date}`, {
      headers: {
        "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
      },
    });

    const events = data?.events || [];

    const groupedEvents = events.reduce((acc, event) => {
      if (event.status?.type === "finished") {
        const league = event.tournament.name;
        if (!acc[league]) acc[league] = [];
        acc[league].push({
          eventId: event.id,
          league,
          country: event.tournament.category.country.name,
          leagueId: event.tournament.id,
          uniqueTournament: data.tournament?.uniqueTournament?.name,
          uniqueTournamentId: event.tournament?.uniqueTournament?.id,
          countryImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_COUNTRYFLAG}${
            event.tournament.category.alpha2 ? event.tournament.category.alpha2 : event.tournament.category.flag
          }`,
          customId:event.customId,
          startTimestamp: event.startTimestamp,
          winnerCode: event.winnerCode,
          homeTeam: event.homeTeam.name,
          homeTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${event.homeTeam.id}`,
          homeTeamId: event.homeTeam.id,
          awayTeam: event.awayTeam.name,
          awayTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${event.awayTeam.id}`,
          awayTeamId: event.awayTeam.id,
          status: event.status,
          season: event.season.id,
        });
      } else {
        return acc;
      }
      return acc;
    }, {});

    successResponse(res, groupedEvents);
  } catch (error) {
    next(error);
  }
};

const Search = async (req, res, next) => {
  try {
    const query = req.body.query;
    if (!query || query.trim() === "") {
      return queryErrorRelatedResponse(res, 400, "Query is required");
    }

    const { data } = await axios.get(`${process.env.WEB_API_URL}/api/v1/search/unique-tournaments/${query}/more`);

    const info = data.uniqueTournaments.reduce((acc, item) => {
      if (item.category.sport.name === "Football") {
        acc.push({
          id: item.id,
          name: item.name,
          image: `${req.protocol}://${req.get("host")}${process.env.LOCAL_UNIQUETOURNAMENTIMAGE}${item.id}`,
          country: item.category.name,
          countryImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_COUNTRYFLAG}${
            item.category.alpha2 ? item.category.alpha2 : item.category.flag
          }`,
        });
      }
      return acc;
    }, []);

    return successResponse(res, info);
  } catch (error) {
    next(error);
  }
};

module.exports = { LiveMatch, UpcomingMatch, CompleteMatch, Search };
