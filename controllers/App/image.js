const axios = require("axios");
const NodeCache = require("node-cache");
const imageCache = new NodeCache({ stdTTL: 3600 });
const rateLimit = require("express-rate-limit");

const imageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const teamImage = async (req, res, next) => {
  try {
    const teamId = req.params.teamId;
    if (!/^\d+$/.test(teamId)) {
      return res.status(400).json({ error: "Invalid team ID" });
    }
    const cacheKey = `team-image-${teamId}`;

    const cachedImage = imageCache.get(cacheKey);
    if (cachedImage) {
      res.set("Content-Type", cachedImage.contentType);
      return res.send(cachedImage.data);
    }

    const response = await axios.get(`https://api.sofascore.app/api/v1/team/${teamId}/image`, {
      responseType: "arraybuffer",
    });

    const contentType = response.headers["content-type"];
    imageCache.set(cacheKey, { contentType, data: response.data });

    res.set("Content-Type", contentType);
    res.send(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({ error: "Failed to fetch image" });
    } else if (error.request) {
      res.status(503).json({ error: "No response from image server" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
    next(error);
  }
};

const uniqueTournamentImage = async (req, res, next) => {
  try {
    const uniqueTournamentId = req.params.uniqueTournamentId;
    if (!/^\d+$/.test(uniqueTournamentId)) {
      return res.status(400).json({ error: "Invalid unique tournament ID" });
    }
    const cacheKey = `unique-tournament-image-${uniqueTournamentId}`;

    const cachedImage = imageCache.get(cacheKey);
    if (cachedImage) {
      res.set("Content-Type", cachedImage.contentType);
      return res.send(cachedImage.data);
    }

    const response = await axios.get(`https://api.sofascore.app/api/v1/unique-tournament/${uniqueTournamentId}/image`, {
      responseType: "arraybuffer",
    });

    const contentType = response.headers["content-type"];
    imageCache.set(cacheKey, { contentType, data: response.data });

    res.set("Content-Type", contentType);
    res.send(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({ error: "Failed to fetch image" });
    } else if (error.request) {
      res.status(503).json({ error: "No response from image server" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
    next(error);
  }
};

const countryFlag = async (req, res, next) => {
  try {
    const flag = req.params.flag.toLowerCase();
    if (!/^[a-z,-]+$/.test(flag)) {
      return res.status(400).json({ error: "Invalid country flag" });
    }
    const cacheKey = `country-flag-${flag}`;

    const cachedImage = imageCache.get(cacheKey);
    if (cachedImage) {
      res.set("Content-Type", cachedImage.contentType);
      return res.send(cachedImage.data);
    }

    const response = await axios.get(`https://api.sofascore.app/static/images/flags/${flag}.png`, {
      responseType: "arraybuffer",
    });

    const contentType = response.headers["content-type"];
    imageCache.set(cacheKey, { contentType, data: response.data });

    res.set("Content-Type", contentType);
    res.send(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({ error: "Failed to fetch image" });
    } else if (error.request) {
      res.status(503).json({ error: "No response from image server" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
    next(error);
  }
};

const playerImage = async (req, res, next) => {
  try {
    const playerId = req.params.playerId;
    if (!/^\d+$/.test(playerId)) {
      return res.status(400).json({ error: "Invalid player ID" });
    }
    const cacheKey = `player-image-${playerId}`;

    const cachedImage = imageCache.get(cacheKey);
    if (cachedImage) {
      res.set("Content-Type", cachedImage.contentType);
      return res.send(cachedImage.data);
    }

    const response = await axios.get(`https://api.sofascore.app/api/v1/player/${playerId}/image`, {
      responseType: "arraybuffer",
    });

    const contentType = response.headers["content-type"];
    imageCache.set(cacheKey, { contentType, data: response.data });

    res.set("Content-Type", contentType);
    res.send(response.data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  teamImage,
  uniqueTournamentImage,
  countryFlag,
  playerImage,
};
