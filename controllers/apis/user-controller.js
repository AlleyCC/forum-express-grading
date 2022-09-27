const jwt = require('jsonwebtoken')
const userServices = require('../../services/user-services')
const userController = {
  signIn: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password // remove password from data, avoid passing it to front-end
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' }) // jwt.sign(payload(=data), secretOrPrivateKey, [options, callback]) || expiresIn:設定簽章有效期限
      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = userController
