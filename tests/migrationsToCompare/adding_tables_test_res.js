module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.createTable({tableName: 'model_add_1', schema: 'temp'}, {
                colUnique: {
                    type: Sequelize.INTEGER,
                    unique: true,
                },
                colPK: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                },
                colAI: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                },
                colDefault: {
                    type: Sequelize.INTEGER,
                    defaultValue: 5,
                },
                colAllowNull: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                },
            }, {transaction: t, schema: 'temp'});
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.dropTable({tableName: 'model_add_1', schema: 'temp'}, {transaction: t});
    }
    );},
};
  