const { Restaurant, User, Category } = require('../models')
const adminServices = {
  getRestaurants: (req, cb) => {
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category] // 把關聯資料拉進來
    })
      .then(restaurants => cb(null, { restaurants }))
      .catch(err => cb(err))
  }
}
module.exports = adminServices
