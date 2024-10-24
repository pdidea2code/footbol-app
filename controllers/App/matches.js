const axios = require("axios");
const { successResponse, queryErrorRelatedResponse } = require("../../helper/sendResponse");

const MatchesDetails = async (req, res, next) => {
  try {
    let event = null;
    try {
      const { data: eventData } = await axios.get(`${process.env.WEB_API_URL}/api/v1/event/${req.body.eventid}`, {
        headers: {
          "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
        }
      });
      event = eventData.event;
    } catch (error) {
      console.error("Error fetching Event:", error);
    }

    if (!event) {
      return queryErrorRelatedResponse(res, 404, "Event not found");
    }




    let ChannelIds = [];
    let tv = null;

    try {
      const { data: tvData } = await axios.get(
        `${process.env.WEB_API_URL}/api/v1/tv/event/${req.body.eventid}/country-channels`,
        {
          headers: {
            "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
            "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
          },
        }
      );
      ChannelIds = tvData.countryChannels?.[req.body.country] || [];
    } catch (error) {
      console.error("Error fetching TV data:", error);
    }
    console.log(event);
    try {
      const { data: tvChannelsData } = await axios.get(
        `${process.env.WEB_API_URL}/api/v1/tv/country/${req.body.country}/channels`,
        {
          headers: {
            "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
            "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
          },
        }
      );

      const matchingChannels = tvChannelsData.channels.filter((channel) =>
        ChannelIds.includes(channel.id)
      );

      tv = matchingChannels.map(channel => channel.name).join(', ');
    } catch (error) {
      console.error("Error fetching TV channels data:", error);
    }

    let playerOfTheMatch = null;

    if (event.status.type === "finished") {
      try {
        const { data: playerData } = await axios.get(
          `${process.env.WEB_API_URL}/api/v1/event/${req.body.eventid}/best-players`,
          {
            headers: {
              "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
              "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
            },
          }
        );

        const { bestHomeTeamPlayer, bestAwayTeamPlayer } = playerData;

        const homePlayer = {
          ...bestHomeTeamPlayer.player,
          rating: parseFloat(bestHomeTeamPlayer.value),
        };

        const awayPlayer = {
          ...bestAwayTeamPlayer.player,
          rating: parseFloat(bestAwayTeamPlayer.value),
        };

        playerOfTheMatch = homePlayer.rating >= awayPlayer.rating ? homePlayer : awayPlayer;
      } catch (error) {
        console.error("Error fetching player data:", error);
      }
    }

    let matchData = null;
    try {
      const { data: incidentsData } = await axios.get(`${process.env.WEB_API_URL}/api/v1/event/${req.body.eventid}/incidents`, {
        headers: {
          "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
        }
      })
      matchData = incidentsData;

    } catch (error) {
      console.error("Error fetching player data:", error);
    }

    const goalScorers = matchData.incidents.filter(incident => incident.incidentType === 'goal');

const groupGoalsByPlayer = (goals) => {
  const groupedGoals = {};
  goals.forEach(goal => {
    const playerName = goal.player.shortName;
    if (!groupedGoals[playerName]) {
      groupedGoals[playerName] = [];
    }
    groupedGoals[playerName].push(goal.time);
  });
  return groupedGoals;
};

const formatGroupedGoals = (groupedGoals) => {
  return Object.entries(groupedGoals).map(([player, times]) => {
    return `${player} ${times.join("', ")}${times.length > 1 ? "'" : ''}`;
  }).join('\n');
};

const homeGoals = goalScorers.filter(goal => goal.isHome);
const awayGoals = goalScorers.filter(goal => !goal.isHome);

const formattedHomeGoals = formatGroupedGoals(groupGoalsByPlayer(homeGoals));
const formattedAwayGoals = formatGroupedGoals(groupGoalsByPlayer(awayGoals));


    const info = {
      eventId: event.id,
      tournament: event.tournament.name,
      country: event.tournament.category.country.name,
      uniqueTournamentImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_UNIQUETOURNAMENTIMAGE}${event.tournament.uniqueTournament.id}`,
      countryImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_COUNTRYFLAG}${event.tournament.category.alpha2 ? event.tournament.category.alpha2 : event.tournament.category.flag
        }`,
      customId: event.customId,
      homeTeam: event.homeTeam.name,
      homeTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${event.homeTeam.id}`,
      homeTeamId: event.homeTeam.id,
      homeTeamScore: event.homeScore.display,
      awayTeam: event.awayTeam.name,
      awayTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${event.awayTeam.id}`,
      awayTeamId: event.awayTeam.id,
      awayTeamScore: event.awayScore.display,
      status: event.status.type,
      startTimestamp: event.startTimestamp,
      venue: `${event.venue?.stadium?.name},${event.venue?.city?.name},${event.venue?.country?.name}`,
      venueId: event.venue,
      tv: tv || null,
      PlayeroftheMatch: playerOfTheMatch || null,
      homeGoals: formattedHomeGoals,
      awayGoals: formattedAwayGoals,
    };

    successResponse(res, info);
  } catch (error) {
    next(error);
  }
};

const Stats = async (req, res, next) => {
  try {
    let data = null;
    try {
      const { data: statsData } = await axios.get(`${process.env.WEB_API_URL}/api/v1/event/${req.body.eventid}/statistics`, {
        headers: {
          "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
        }
      })
      data = statsData;
    }
    catch (error) {
      return queryErrorRelatedResponse(res, 404, "Stats not found");
    }

    successResponse(res, data.statistics[0]);
  } catch (error) {
    next(error);
  }
}

const Lineups = async (req, res, next) => {
  try {
    let data = null;

    try {

      const { data: lineupData } = await axios.get(`${process.env.WEB_API_URL}/api/v1/event/${req.body.eventid}/lineups`, {
        headers: {
          "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
        }
      })
      data = lineupData;
    } catch (error) {
      return queryErrorRelatedResponse(res, 404, "Lineups not found");
    }

    function extractPlayerInfo(data) {
      const extractInfo = (player) => ({
        name: player.player.name,
        shortName: player.player.shortName,
        position: player.player.position,
        jerseyNumber: player.player.jerseyNumber,
        id: player.player.id,
        substitute: player.substitute,
        captain: player.captain || false,
        statistics: player.statistics
      });

      return {
        homeTeamformation: data.home.formation,
        awayTeamformation: data.away.formation,
        homeTeamAbsence: data.home?.missingPlayers.map(extractInfo),
        awayTeamAbsence: data.away?.missingPlayers.map(extractInfo),
        home: data.home.players.map(extractInfo),
        away: data.away.players.map(extractInfo)
      };
    }


    const selectedData = extractPlayerInfo(data);
    //
    successResponse(res, selectedData);
  } catch (error) {
    next(error);
  }
}

const H2H = async (req, res, next) => {
  try {
    let data = null;
    try {
      const { data: h2hData } = await axios.get(`${process.env.WEB_API_URL}/api/v1/event/${req.body.customId}/h2h/events`, {
        headers: {
          "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
        }
      })
      data = h2hData;
    } catch (error) {
      return queryErrorRelatedResponse(res, 404, "H2H not found");
    }

    const headToHead = data.events.map(event => ({
      eventId: event.id,
      homeTeam: event.homeTeam.name,
      awayTeam: event.awayTeam.name,
      homeTeamId: event.homeTeam.id,
      awayTeamId: event.awayTeam.id,
      homeTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${event.homeTeam.id}`,
      awayTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${event.awayTeam.id}`,
      homeTeamScore: event.homeScore.display,
      awayTeamScore: event.awayScore.display,
      status: event.status.type,
      startTimestamp: event.startTimestamp,
    }));
    successResponse(res, headToHead);
  } catch (error) {
    next(error);
  }
}

module.exports = { MatchesDetails, Stats, Lineups, H2H };
