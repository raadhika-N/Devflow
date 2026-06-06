const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token is in the Authorization header
    // It should look like:  Authorization: Bearer eyJhbG...
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      // Split "Bearer eyJhbG..." into ["Bearer", "eyJhbG..."]
      // We take index [1] which is the actual token
    }

    // If no token found, block the request
    if (!token) {
      return sendError(res, 401, 'You are not logged in. Please log in to continue.');
    }

    // Verify the token is genuine and not expired
    // If someone tampered with it, this will throw an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded will be:  { id: "user_mongo_id", iat: ..., exp: ... }

    // Find the actual user from DB using the id stored in token
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return sendError(res, 401, 'The user belonging to this token no longer exists.');
    }

    // Attach user to the request object
    // Now any route that uses this middleware can access req.user
    req.user = currentUser;

    // Call next() to pass control to the actual route handler
    next();

  } catch (error) {
    // jwt.verify throws errors if token is invalid or expired
    return sendError(res, 401, 'Invalid or expired token. Please log in again.');
  }
};

module.exports = { protect };