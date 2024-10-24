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
      
      
      // Aggregate score calculation
      const aggregatedHomeScore = data.homeScore?.period1 + data.homeScore?.period2;
      const aggregatedAwayScore = data.awayScore?.period1 + data.awayScore?.period2;
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
        customId: data.customId,
        homeTeamImg: `${req.protocol + "://" + req.get("host") + process.env.LOCAL_TEAM_IMAGE + data.homeTeam.id}`,
        homeTeamId: data.homeTeam.id,
        homeScore: data.homeScore.display,
        homeTeamShortName: data.homeTeam.shortName,
        aggregatedHomeScore: aggregatedHomeScore ? aggregatedHomeScore : 0,
        awayTeam: data.awayTeam.name,
        awayTeamImage: `${req.protocol + "://" + req.get("host") + process.env.LOCAL_TEAM_IMAGE + data.awayTeam.id}`,
        awayTeamId: data.awayTeam.id,
        awayScore: data.awayScore.display,
        aggregatedAwayScore: aggregatedAwayScore ? aggregatedAwayScore : 0 ,
        awayTeamShortName: data.awayTeam.shortName,
        aggregatedScore: `${aggregatedHomeScore ? aggregatedHomeScore : 0} - ${aggregatedAwayScore ? aggregatedAwayScore : 0  }`,
        status: data.status,
        seasonid: data.season?.id ? data.season.id : null,
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

    // const groupedEvents = events.reduce((acc, event) => {
    //   if (event.status?.type === "finished") return acc;

    //   const league = event.tournament.name;
    //   if (!acc[league]) acc[league] = [];

    //   acc[league].push({
    //     eventId: event.id,
    //     league,
    //     country: event.tournament.category.country.name,
    //     leagueId: event.tournament.id,
    //     uniqueTournament: data.tournament?.uniqueTournament?.name,
    //     uniqueTournamentId: event.tournament?.uniqueTournament?.id,
    //     countryImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_COUNTRYFLAG}${
    //       event.tournament.category.alpha2 ? event.tournament.category.alpha2 : event.tournament.category.flag
    //     }`,
    //     customId: event.customId,
    //     startTimestamp: event.startTimestamp,
    //     homeTeam: event.homeTeam.name,
    //     homeTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${event.homeTeam.id}`,
    //     homeTeamId: event.homeTeam.id,
    //     awayTeam: event.awayTeam.name,
    //     awayTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${event.awayTeam.id}`,
    //     awayTeamId: event.awayTeam.id,
    //     status: event.status,
    //     season: event.season.id,
    //   });

    //   return acc;
    // }, {});

    // const firstTwoGroups = Object.fromEntries(
    //   Object.entries(groupedEvents).slice(0, 2)
    // );

    const groupedEvents = events
      .filter((event) => event.status?.type !== "finished") // Filter out finished events
      .map((event) => ({
        eventId: event.id,
        league: `${event.tournament.name}`,
        leagueId: event.tournament.id,
        uniqueTournament: event.tournament?.uniqueTournament?.name,
        uniqueTournamentId: event.tournament?.uniqueTournament?.id,
        countryImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_COUNTRYFLAG}${
          event.tournament.category.alpha2 || event.tournament.category.flag
        }`,
        customId: event.customId,
        startTimestamp: event.startTimestamp,
        time: new Date(event.startTimestamp * 1000).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        homeTeam: event.homeTeam.name,
        homeTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${event.homeTeam.id}`,
        homeTeamId: event.homeTeam.id,
        homeTeamShortName: event.homeTeam.shortName,
        awayTeam: event.awayTeam.name,
        awayTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${event.awayTeam.id}`,
        awayTeamId: event.awayTeam.id,
        awayTeamShortName: event.awayTeam.shortName,
        status: event.status,
        type: event.status,
        season: event.season.id,
      }));

    // Grouping events by league
    const formattedEvents = groupedEvents.reduce((acc, event) => {
      let league = acc.find((l) => l.league === event.league);

      if (!league) {
        league = {
          league: event.league,
          leagueId: event.leagueId,
          uniqueTournament: event.uniqueTournament,
          uniqueTournamentId: event.uniqueTournamentId,
          countryImage: event.countryImage,
          matches: [],
        };
        acc.push(league);
      }

      // Add match to the league's matches array
      league.matches.push({
        eventId: event.eventId,
        homeTeam: event.homeTeam,
        homeTeamImage: event.homeTeamImage,
        homeTeamId: event.homeTeamId,
        homeTeamShortName: event.homeTeamShortName,
        awayTeam: event.awayTeam,
        awayTeamImage: event.awayTeamImage,
        awayTeamId: event.awayTeamId,
        awayTeamShortName: event.awayTeamShortName,
        time: event.time,
        startTimestamp: event.startTimestamp,
        customId: event.customId,
        status: event.status,
        type: event.type,
        season: event.season,
        uniqueTournament: event.uniqueTournament,
        uniqueTournamentId: event.uniqueTournamentId,
        leagueId: event.leagueId,
        countryImage: event.countryImage,
      });

      return acc;
    }, []);

    // Add pagination parameters
    const page = parseInt(req.body.page) || 1;
    const itemsPerPage = 10;

    // Implement pagination
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedEvents = formattedEvents.slice(startIndex, endIndex);

    const totalPages = Math.ceil(formattedEvents.length / itemsPerPage);

    const response = {
      events: paginatedEvents,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        itemsPerPage: itemsPerPage,
        totalItems: formattedEvents.length,
      },
    };

    return successResponse(res, response);
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
        const league = `${event.tournament.category.country.name} - ${event.tournament.name}`;

        if (!acc[league]) {
          acc[league] = {
            league,
            leagueId: event.tournament.id,
            uniqueTournament: event.tournament?.uniqueTournament?.name,
            uniqueTournamentId: event.tournament?.uniqueTournament?.id,
            countryImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_COUNTRYFLAG}${
              event.tournament.category.alpha2 || event.tournament.category.flag
            }`,
            matches: [],
          };
        }

        acc[league].matches.push({
          eventId: event.id,
          customId: event.customId,
          startTimestamp: event.startTimestamp,
          time: new Date(event.startTimestamp * 1000).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          winnerCode: event.winnerCode,
          homeTeam: event.homeTeam.name,
          homeTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${event.homeTeam.id}`,
          homeTeamId: event.homeTeam.id,
          homeTeamShortName: event.homeTeam.shortName,
          awayTeam: event.awayTeam.name,
          awayTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${event.awayTeam.id}`,
          awayTeamId: event.awayTeam.id,
          awayTeamShortName: event.awayTeam.shortName,
          status: event.status,
          season: event.season.id,
          type: event.type,
          uniqueTournament: event.tournament.uniqueTournament?.name,
          uniqueTournamentId: event.tournament.uniqueTournament?.id,
          leagueId: event.tournament.id,
          countryImage: event.countryImage,
        });

        return acc;
      }
      return acc;
    }, {});

    // Add pagination parameters
    const page = parseInt(req.body.page) || 1;
    const itemsPerPage = 10;

    // Convert the result to an array of leagues
    const formattedEvents = Object.values(groupedEvents);

    // Implement pagination
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedEvents = formattedEvents.slice(startIndex, endIndex);

    const totalPages = Math.ceil(formattedEvents.length / itemsPerPage);

    const response = {
      events: paginatedEvents,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        itemsPerPage: itemsPerPage,
        totalItems: formattedEvents.length,
      },
    };

    successResponse(res, response);
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
    if(query.length<3){
      return queryErrorRelatedResponse(res, 400, "Query must be at least 3 characters");
    }

    let teamData = null;
    try {
      const { data } = await axios.get(`${process.env.WEB_API_URL}/api/v1/search/teams/${req.body.query}/more`);
      teamData = data.teams;
      // console.log(teamData);
    } catch (error) {
      return queryErrorRelatedResponse(res, 400, "Invalid query");
    }

    // let info = {
    //   team:[]
    // };

    // if (teamData) {
    // let teamInfo = teamData.reduce((acc, item) => {
    //   if (item.category.sport.name === "Football") {
    //     acc.push({
    //       id: item.id,
    //       name: item.name,
    //       image: `${req.protocol}://${req.get("host")}${process.env.LOCAL_UNIQUETOURNAMENTIMAGE}${item.id}`,
    //       country: item.category.name,
    //       countryImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_COUNTRYFLAG}${
    //         item.category.alpha2 ? item.category.alpha2 : item.category.flag
    //       }`,
    //     });
    //   }
    //   return acc;
    //   }, []);
    //   info = {
    //     team: teamInfo ? teamInfo : [],
    //   };
    // }

    

    return successResponse(res, teamData);
  } catch (error) {
    next(error);
  }
};

const country = async (req, res, next) => {
  try {
    let data = null;
   try{
    const { data: countryData } = await axios.get(`${process.env.WEB_API_URL}/api/v1/sport/football/categories`, {
      headers: {
        "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
      }
    });
    data = countryData.categories;
   }catch(error){
    console.log(error);
   }
   if(!data){
    return queryErrorRelatedResponse(res, 404, "Country not found");
   }
   
   const info = data.map((item) => {
    return {
      countryId: item.id,
      countryName: item.name,
      countryImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_COUNTRYFLAG}${item.alpha2 ? item.alpha2 : item.flag}`,
      
    }
   })
   successResponse(res, info);
  } catch (error) {
    next(error);
  }
}

const uniqueTournamentbyCountry = async (req, res, next) => {
try{
  let data = null;
try {
  const { data: uniqueTournamentData } = await axios.get(`${process.env.WEB_API_URL}/api/v1/category/${req.body.countryId}/unique-tournaments`, {
    headers: {
      "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
      "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
    }
  });
  data = uniqueTournamentData.groups[0].uniqueTournaments;
} catch (error) {
  console.log(error);
}
if(!data){
  return queryErrorRelatedResponse(res, 404, "Unique Tournament not found");
}

const info = data.map((item) => {
  return {
    uniqueTournamentsId: item.id,
    uniqueTournamentsName: item.name,
    uniqueTournamentsImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_UNIQUETOURNAMENTIMAGE}${item.id}`,
}})
return successResponse(res, info);
}catch(error){
  next(error);
}
}

module.exports = { LiveMatch, UpcomingMatch, CompleteMatch, Search, country, uniqueTournamentbyCountry };
