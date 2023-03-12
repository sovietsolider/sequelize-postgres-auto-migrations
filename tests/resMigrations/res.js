module.exports = {
    up: async (queryInterface, Sequelize) => {
        
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            
        });
    },
};