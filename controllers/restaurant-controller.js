const { Restaurant, Category, User, Comment } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const restaurantController = {
  getRestaurants: (req, res, next) => {
    const DEFAULT_LIMIT = 9 // 預設值: 一頁9筆資料
    const categoryId = Number(req.query.categoryId) || '' // '' => 表"全部分類""
    const page = Number(req.query.page) || 1 // 若queryString沒有攜帶特定數字則傳入1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    return Promise.all([Restaurant.findAndCountAll({
      raw: true,
      nest: true,
      include: Category,
      where: {
        ...categoryId ? { categoryId } : {} // 檢查categoryId是否為空值
      },
      limit,
      offset
    }),
    Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const favoritedRestaurantsId = req.user && req.user.FavoritedRestaurants.map(fr => fr.id) // 最愛餐廳清單的餐廳id
        const likedRestaurantsId = req.user && req.user.LikedRestaurants.map(likedRest => likedRest.id)
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50) + '...',
          isFavorited: favoritedRestaurantsId.includes(r.id), // 回傳true/false
          isLiked: likedRestaurantsId.includes(r.id)
        }))
        return res.render('restaurants', { restaurants: data, categories, categoryId, pagination: getPagination(limit, page, restaurants.count) })
      })
      .catch(err => next(err))
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
