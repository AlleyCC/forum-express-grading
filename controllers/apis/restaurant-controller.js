const restaurantServices = require('../../services/restaurant-services')
const restaurantController = {
  getRestaurants: (req, res, next) => {
    return restaurantServices.getRestaurants(req, (err, data) => {
      err ? next(err) : res.json(data)
    })
  }

}
module.exports = restaurantController
