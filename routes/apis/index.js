const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')
const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')
const passport = require('../../config/passport')
const { apiErrorHandler } = require('../../middleware/error-handler')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')

// 後台
router.use('/admin', authenticated, authenticatedAdmin, admin)
router.get('/restaurants', authenticated, restController.getRestaurants)

// sign in
router.post('/signup', userController.signUp)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', session: false }), userController.signIn) // 不須設定failureFlash、session要關掉
router.use('/', apiErrorHandler)

module.exports = router
