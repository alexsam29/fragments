const hashEmail = require('../hash');
const passport = require('passport');

module.exports = (strategy) => (req, res, next) => {
  // Hash the user's email address on req
  if (req.user && req.user.email) {
    req.user.email = hashEmail(req.user.email);
  }

  // Delegate the authorization to the specified strategy middleware
  return passport.authenticate(strategy, { session: false })(req, res, next);
};
