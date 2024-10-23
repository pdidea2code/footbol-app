const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { queryErrorRelatedResponse } = require("./sendResponse");

module.exports = async function (req, res, next) {
  let token = req.header("Authorization");

  if (token) {
    token = req.header("Authorization").replace("Bearer ", "");
  }

  if (!token) return queryErrorRelatedResponse(req, res, 402, "Access Denied.");
  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    let admin = await Admin.findOne({ email: verified.email });
    if (!admin) {
      return queryErrorRelatedResponse(req, res, 402, "Access Denied.");
    }

    req.admin = admin;
    req.token = token;
    next();
  } catch (error) {
    queryErrorRelatedResponse(req, res, 402, "Invalid Token.");
  }
};
