const passport = require('../config/passport')
const authenticated = passport.authenticate('jwt', { session: false })
const authenticatedAdmin = (req, res, next) => { // 判斷user是不是Admin
  if (req.user && req.user.isAdmin) return next()
  res.status(403).json({ status: 'error', message: 'permission denied' })
}
module.exports = { authenticated, authenticatedAdmin }
