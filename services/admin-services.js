const { Restaurant, Category } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')
const adminServices = {
  getRestaurants: (req, cb) => {
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category] // 把關聯資料拉進來
    })
      .then(restaurants => cb(null, { restaurants }))
      .catch(err => cb(err))
  },
  postRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required.')
    const { file } = req
    imgurFileHandler(file) // 把檔案取出交給file-hepler處理
      .then(filePath => Restaurant.create({ // 回傳filePath檔案路徑
        name,
        tel,
        address,
        openingHours,
        description,
        image: filePath || null, // 若資料夾內有image則回傳，無責回傳null
        categoryId
      }))
      .then(newRestaurant => cb(null, { restaurant: newRestaurant }))
      .catch(err => cb(err))
  },
  deleteRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) {
          const err = new Error("Restaurant didn't exist.")
          err.status = 404
          throw err
        }
        return restaurant.destroy()
      })
      .then(deletedRestaurant => cb(null, { restaurant: deletedRestaurant }))
      .catch(err => cb(err))
  }

}
module.exports = adminServices
