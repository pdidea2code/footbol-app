const axios = require("axios");
const { successResponse } = require("../../helper/sendResponse");

const NextMatch = async (req, res, next) => {
  try {
    const { data,headers } = await axios.get(`${process.env.WEB_API_URL}/api/v1/team/${req.body.teamid}/events/next/0`, {
        headers: {
          "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
        }
      });

      const event = data.events[0];
    successResponse(res, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  NextMatch,
};
