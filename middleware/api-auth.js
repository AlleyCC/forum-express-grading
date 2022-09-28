const passport = require('../config/passport')
const authenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.status(401).json({ status: 'error', message: 'unauthorized' })
    next()
  })(req, res, next)
}
const authenticatedAdmin = (req, res, next) => { // 判斷user是不是Admin
  console.log(req.user)
  if (req.user && req.user.isAdmin) return next()
  res.status(403).json({ status: 'error', message: 'permission denied' })
}
module.exports = {
  authenticated,
  authenticatedAdmin
}
