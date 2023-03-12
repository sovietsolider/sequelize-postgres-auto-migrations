module.exports = {
 up: async (queryInterface, Sequelize) => {
await queryInterface.sequelize.transaction(async (t) => {});},down: async (queryInterface, Sequelize) => {await queryInterface.sequelize.transaction(async (t) => {});},};