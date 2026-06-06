const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ─────────────────────────────────────────
// Helper function to generate a JWT token
// Takes a userId, returns a signed token string
// ─────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },                    // payload: what's stored inside the token
    process.env.JWT_SECRET,            // secret key: used to sign the token
    { expiresIn: process.env.JWT_EXPIRES_IN }  // token expires in 7 days
  );
};


// ─────────────────────────────────────────
// SIGNUP
// POST /api/auth/signup
// ─────────────────────────────────────────
const signup = async (req, res) => {
    console.log('signup hit', req.body);
  try {
    const { name, email, password } = req.body;

    // 1. Check all fields are present
    if (!name || !email || !password) {
      return sendError(res, 400, 'Please provide name, email and password');
    }

    // 2. Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'An account with this email already exists');
    }

    // 3. Create the user
    // Password gets automatically hashed by the pre('save') hook in the model
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10)});

    // 4. Generate JWT token for this new user
    const token = generateToken(user._id);

    // 5. Send back the token and user info (never send the password)
    return sendSuccess(res, 201, 'Account created successfully', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// ─────────────────────────────────────────
// LOGIN
// POST /api/auth/login
// ─────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check fields are present
    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password');
    }

    // 2. Find the user by email
    // We use .select('+password') because we set select:false in the model
    // We explicitly need the password here to compare it
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // Don't tell them "email not found" — that's a security leak
      // Just say credentials are wrong
      return sendError(res, 401, 'Invalid email or password');
    }

    // 3. Compare entered password with stored hashed password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // 4. Generate token
    const token = generateToken(user._id);

    // 5. Send back token and user info
    return sendSuccess(res, 200, 'Login successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// ─────────────────────────────────────────
// GET CURRENT USER (me)
// GET /api/auth/me
// Protected route — only logged in users
// ─────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    // We already have the user attached to the request
    const user = await User.findById(req.user.id);

    return sendSuccess(res, 200, 'User fetched successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


module.exports = { signup, login, getMe };