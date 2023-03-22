module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.dropTable({tableName: 'Model1', schema: 'temp'}, {transaction: t});
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.createTable({tableName: 'model_add_1', schema: 'temp'}, {
            colUnique: {
                "type": Sequelize.INTEGER,
                "allowNull": true,
                "unique": true
            },
            colPK: {
                "type": Sequelize.INTEGER,
                "allowNull": false,
                "primaryKey": true
            },
            colAI: {
                "type": Sequelize.INTEGER,
                "autoIncrement": true,
                "allowNull": false
            },
            colDefault: {
                "type": Sequelize.INTEGER,
                "defaultValue": "5",
                "allowNull": true
            },
            colAllowNull: {
                "type": Sequelize.INTEGER,
                "allowNull": true
            },
        }, {transaction: t, schema: 'temp'});
    }
    );},
};
  