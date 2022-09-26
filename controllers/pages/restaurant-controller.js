const restaurantServices = require('../../services/restaurant-services')
const { Restaurant, Category, User, Comment } = require('../../models')
const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => {
      err ? next(err) : res.render('restaurants', data)
    })
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' }, // 增加餐廳的使用者關聯
        { model: User, as: 'LikedUsers' }
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id) // 檢查所有喜歡這間餐廳的名單中有沒有包括使用者的id
        const isLiked = restaurant.LikedUsers.some(i => i.id === req.user.id)
        restaurant.increment('viewCounts', { by: 1 })

        return res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLiked })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    // commentedCount + favoritedCount
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        Comment,
        { model: User, as: 'FavoritedUsers' }
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist.")
        const result = restaurant.toJSON()
        console.log(result)
        return res.render('dashboard', { restaurant: result })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({ // 篩選出'最新的10筆資料'
        limit: 10, // 指定數量
        order: [['createdAt', 'DESC']], // 要排序的欄位
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', { restaurants, comments })
      })
      .catch(err => next(err))
  },
  getTopRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      include: [{
        model: User,
        as: 'FavoritedUsers'
      }]
    })
      .then(restaurants => {
        const result = restaurants.map(restaurant => ({
          ...restaurant.dataValues,
          favoritedCount: restaurant.FavoritedUsers.length,
          isFavorited: req.user && req.user.FavoritedRestaurants.map(r => r.id).includes(restaurant.id)
        })).sort((a, b) => b.favoritedCount - a.favoritedCount)
        result.slice(0, 10)
        return res.render('top-restaurants', { restaurants: result })
      })
      .catch(err => next(err))
  }
}
module.exports = restaurantController
