'use strict'

module.exports = {
  async up (queryInterface, Sequelize) { // public async bulkInsert(tableName: string, records: Array, options: object, attributes: object): Promise
    await queryInterface.bulkInsert('Categories', ['中式料理', '日本料理', '義大利料理', '墨西哥料理', '素食料理', '美式料理', '複合式料理']
      .map(item => {
        return {
          name: item,
          created_at: new Date(),
          updated_at: new Date()
        }
      }), {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', {})
  }
}
