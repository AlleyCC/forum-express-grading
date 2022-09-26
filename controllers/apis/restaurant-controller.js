const { Restaurant, Category } = require('../../models')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')
const restaurantController = {
  getRestaurants: (req, res, next) => {
    const DEFAULT_LIMIT = 9 // 預設值: 一頁9筆資料
    const categoryId = Number(req.query.categoryId) || '' // '' => 空值表"全部分類""
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
        const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id) : [] // 先檢查req.user存在與否，有則回傳喜愛餐廳名單，無則回傳空陣列
        const likedRestaurantsId = req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(likedRest => likedRest.id) : []
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50) + '...',
          isFavorited: favoritedRestaurantsId.includes(r.id), // 回傳true/false
          isLiked: likedRestaurantsId.includes(r.id)
        }))
        return res.json({
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch(err => next(err))
  }

}
module.exports = restaurantController
