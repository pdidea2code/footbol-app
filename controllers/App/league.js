const { successResponse, queryErrorRelatedResponse } = require("../../helper/sendResponse");
const axios = require("axios");

const Matches = async (req, res, next) => {
  try {
    if (!process.env.API_URL || !process.env.X_RAPIDAPI_KEY || !process.env.X_RAPIDAPI_HOST) {
      throw new Error("Missing required environment variables");
    }

    if(!req.body.seasonid||req.body.seasonid===""){
      try{
        const { data } = await axios.get(`${process.env.WEB_API_URL}/api/v1/unique-tournament/${req.body.uniqueTournamentId}/seasons`);
        if(!data){
          return queryErrorRelatedResponse(res, 404, "Season not found");
        }
        req.body.seasonid = data.seasons[0].id;
      //  return successResponse(res, data);
      }catch(error){
        return queryErrorRelatedResponse(res, 404, "Season not found");
      }
    }

    const fetchData = async (url) => {
      const { data } = await axios.get(url, {
        headers: {
          "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
        },
      });
      return data?.events || [];
    };



    const baseUrl = `${process.env.WEB_API_URL}/api/v1/unique-tournament/${req.body.uniqueTournamentId}/season/${req.body.seasonid}/events`;
    let allEvents = [];

    // Fetch "next" events
    let nextIndex = 0;
    while (true) {
      try {
        const nextEvents = await fetchData(`${baseUrl}/next/${nextIndex}`);
        if (nextEvents.length === 0) break;
        allEvents = [...allEvents, ...nextEvents];
        nextIndex++;
      } catch (error) {
        console.error(`Error fetching next events at index ${nextIndex}:`, error.message);
        break;
      }
    }

    // Fetch "last" events
    let lastIndex = 0;
    while (true) {
      try {
        const lastEvents = await fetchData(`${baseUrl}/last/${lastIndex}`);
        if (lastEvents.length === 0) break;
        allEvents = [...allEvents, ...lastEvents];
        lastIndex++;
      } catch (error) {
        console.error(`Error fetching last events at index ${lastIndex}:`, error.message);
        break;
      }
    }

    // Remove duplicates based on event ID
    allEvents = Array.from(new Map(allEvents.map(event => [event.id, event])).values());

    // Sort events by startTimestamp
    allEvents.sort((a, b) => a.startTimestamp - b.startTimestamp);

    const groupedInfo = allEvents.reduce((acc, data) => {
      const date = new Date(data.startTimestamp * 1000);
      const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!acc[formattedDate]) {
        acc[formattedDate] = {
          date: formattedDate,
          matches: [],
        };
      }
      acc[formattedDate].matches.push({
        eventid: data.id,
        name: data.tournament.name,
        customId: data.customId,
        leagueId: data.tournament.id,
        uniqueTournament: data.tournament.uniqueTournament?.name,
        uniqueTournamentId: data.tournament.uniqueTournament?.id,
        uniqueTournamentColor: data.tournament.uniqueTournament?.primaryColorHex,
        uniqueTournamentImage: data.tournament.uniqueTournament
          ? `${req.protocol}://${req.get("host")}${process.env.LOCAL_UNIQUETOURNAMENTIMAGE}${
              data.tournament.uniqueTournament?.id
            }`
          : null,
        countryImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_COUNTRYFLAG}${
          data.tournament.category.alpha2 ? data.tournament.category.alpha2 : data.tournament.category.flag
        }`,
        startTimestamp: data.startTimestamp,
        homeTeam: data.homeTeam.name,
        homeTeamImg: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${data.homeTeam.id}`,
        homeTeamId: data.homeTeam.id,
        homeScore: data.homeScore.display,
        homeTeamShortName: data.homeTeam.shortName,
        awayTeam: data.awayTeam.name,
        awayTeamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${data.awayTeam.id}`,
        awayTeamId: data.awayTeam.id,
        awayScore: data.awayScore.display,
        awayTeamShortName: data.awayTeam.shortName,
        status: data.status,
      });
      return acc;
    }, {});

    const sortedDates = Object.keys(groupedInfo).sort((a, b) => new Date(a) - new Date(b));

    // Add pagination
    const page = parseInt(req.body.page) || 1;
    const groupsPerPage = 10;
    const startIndex = (page - 1) * groupsPerPage;
    const endIndex = page * groupsPerPage;

    const paginatedGroups = sortedDates.slice(startIndex, endIndex).map((date) => groupedInfo[date]);

    const paginationData = {
      currentPage: page,
      totalPages: Math.ceil(sortedDates.length / groupsPerPage),
      totalGroups: sortedDates.length,
      groupsPerPage: groupsPerPage,
    };

    successResponse(res, {
      matches: paginatedGroups,
      pagination: paginationData,
    });
  } catch (error) {
    next(error);
  }
};

const Table = async (req, res, next) => {
  try {
    if (!process.env.API_URL || !process.env.X_RAPIDAPI_KEY || !process.env.X_RAPIDAPI_HOST) {
      throw new Error("Missing required environment variables");
    }
    let standings = null;
    try {
      const { data, headers } = await axios.get(
        `${process.env.WEB_API_URL}/api/v1/unique-tournament/${req.body.uniqueTournamentId}/season/${req.body.seasonid}/standings/total`,
        {
          headers: {
            "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
            "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
          },
        }
      );
      standings = data?.standings || [];
    } catch (error) {
      console.error("Error fetching Table:", error);
    }
    if (!standings) {
      return queryErrorRelatedResponse(res, 404, "Data not found");
    }

    const info = standings.flatMap((standing) => {
      const rows = standing.rows || [];
      return rows.map((row) => ({
        teamId: row.team.id,
        teamName: row.team.name,
        teamImage: `${req.protocol}://${req.get("host")}${process.env.LOCAL_TEAM_IMAGE}${row.team.id}`,
        teamShortName: row.team.shortName,
        points: row.points,
        position: row.position,
        matches: row.matches,
        wins: row.wins,
        draws: row.draws,
        losses: row.losses,
        scoresFor: row.scoresFor,
        scoresAgainst: row.scoresAgainst,
        groupName: standing.name,
      }));
    });

    successResponse(res, { standings: info });
  } catch (error) {
    next(error);
  }
};

const TopPlayers = async (req, res, next) => {
  try {
    if (!process.env.API_URL || !process.env.X_RAPIDAPI_KEY || !process.env.X_RAPIDAPI_HOST) {
      throw new Error("Missing required environment variables");
    }

    const { data, headers } = await axios.get(
      `${process.env.WEB_API_URL}/api/v1/unique-tournament/${req.body.uniqueTournamentId}/season/${req.body.seasonid}/statistics?limit=10&order=-goals&accumulation=total&group=summary`,

      {
        headers: {
          "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
        },
      }
    );
    const players = data?.results || [];
    const info = players.map((data) => {
      const info = {
        playerId: data.player.id,
        playerName: data.player.name,
        playerImage: `${req.protocol + "://" + req.get("host") + process.env.LOCAL_PLAYERIMAGE + data.player.id}`,
        playerRating: data.rating,
        playerShortName: data.player.shortName,
        goals: data.goals,
        assists: data.assists,
        "goals+assists": data.goals + data.assists,
        tackles: data.tackles,
        accuratePassesPercentage: data.accuratePassesPercentage,
        successfulDribbles: data.successfulDribbles,
        teamId: data.team.id,
        teamName: data.team.name,
        teamImage: `${req.protocol + "://" + req.get("host") + process.env.LOCAL_TEAM_IMAGE + data.team.id}`,
      };
      return info;
    });
    successResponse(res, info);
  } catch (error) {
    next(error);
  }
};

const TopTeam = async (req, res, next) => {
  try {
    if (!process.env.API_URL || !process.env.X_RAPIDAPI_KEY || !process.env.X_RAPIDAPI_HOST) {
      throw new Error("Missing required environment variables");
    }
    let team = {};
    try {
      const { data, headers } = await axios.get(
        `${process.env.WEB_API_URL}/api/v1/unique-tournament/${req.body.uniqueTournamentId}/season/${req.body.seasonid}/top-teams/overall`,
        {
          headers: {
            "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
            "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
          },
        }
      );

      team = data?.topTeams || {};
    } catch (error) {
      console.error("Error fetching Top Team:", error);
    }

    // const team = data?.topTeams || {};
    const extractedData = {};
    const statisticsKeys = Object.keys(team);
    statisticsKeys.forEach((key) => {
      if (key === "avgRating") {
        return;
      }
      if (team[key]) {
        extractedData[key] = team[key].map((team) => ({
          name: team.team.name,
          shortName: team.team.shortName,
          id: team.team.id,
          statistics: team.statistics,
          teamImage: `${req.protocol + "://" + req.get("host") + process.env.LOCAL_TEAM_IMAGE + team.team.id}`,
        }));
      }
    });

    successResponse(res, extractedData);
  } catch (error) {
    next(error);
  }
};

const Knockout = async (req, res, next) => {
  try {
    const { data, headers } = await axios.get(
      `${process.env.WEB_API_URL}/api/v1/unique-tournament/${req.body.uniqueTournamentId}/season/${req.body.seasonid}/cuptrees`,
      {
        headers: {
          "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
        },
      }
    );
    const cup = data.cupTrees[0];
    const extractedData = {
      id: cup.id,
      name: cup.name,
      currentRound: cup.currentRound,
      rounds: cup.rounds.map((round) => ({
        order: round.order,
        description: round.description,
        blocks: round.blocks.map((block) => ({
          blockId: block.blockId,
          finished: block.finished,
          matchesInRound: block.matchesInRound,
          order: block.order,
          result: block.result,
          homeTeamScore: block.homeTeamScore,
          awayTeamScore: block.awayTeamScore,
          participants: block.participants.map((participant) => ({
            teamName: participant.team.name,
            teamShortName: participant.team.shortName,
            teamId: participant.team.id,
            teamImage: `${req.protocol + "://" + req.get("host") + process.env.LOCAL_TEAM_IMAGE + participant.team.id}`,
            participantId: participant.id,
            winner: participant.winner,
          })),
          events: block.events,
          id: block.id,
        })),
      })),
    };

    successResponse(res, extractedData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  Matches,
  Table,
  TopPlayers,
  TopTeam,
  Knockout,
};
