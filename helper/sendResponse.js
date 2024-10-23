// Utility function to create a response for a successful resource creation
const createResponse = (res, data) => {
  res.status(201).json({ isSuccess: true, status: 201, info: data });
};

// Utility function to create an error response related to query issues
const queryErrorRelatedResponse = (res, status = 400, message) => {
  res.status(status).json({ isSuccess: false, status, message });
};

// Utility function to send a standard success response
const successResponse = (res, data, baseUrl = null) => {
  const responsePayload = { isSuccess: true, status: 200, info: data };
  if (baseUrl) responsePayload.baseUrl = baseUrl;

  res.status(200).json(responsePayload);
};

// Utility function to send a response for a successful deletion
const deleteResponse = (res, message) => {
  res.status(202).json({ isSuccess: true, status: 202, message });
};

module.exports = { createResponse, queryErrorRelatedResponse, successResponse, deleteResponse };
