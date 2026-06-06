const { sendError } = require('../utils/apiResponse');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Parse and validate req.body against the schema
      // If valid, req.body is replaced with the cleaned/parsed data
      req.body = schema.parse(req.body);
      next(); // validation passed, continue to controller
    } catch (err) {
      // zod throws a ZodError with an array of issues
      const errors = err.errors || err.issues;  // ✅
const message = errors
        .map(e => e.message)
        .join(', ');
      return sendError(res, 400, message);
    }
  };
};

module.exports = validate;