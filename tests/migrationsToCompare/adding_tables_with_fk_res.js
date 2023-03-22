module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.createTable({tableName: 'Model3', schema: 'public'}, {
                model3Col1: {
                    type: Sequelize.STRING(255),
                    primaryKey: true,
                    allowNull: false,
                },
            }, {transaction: t, schema: 'public'});
            await queryInterface.createTable({tableName: 'Model1', schema: 'public'}, {
                col1: {
                    type: Sequelize.STRING(255),
                    primaryKey: true,
                    autoIncrement: true,
                },
                col2: {
                    type: Sequelize.ARRAY(Sequelize.ENUM('1','2','3')),
                }
            }, {transaction: t, schema: 'public'});
            await queryInterface.createTable({tableName: 'Model2', schema: 'public'}, {
                pk: {
                    type: Sequelize.INTEGER,
                },
                fk3: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: {tableName: 'Model3', schema: 'public'},
                        key: 'id'
                    },

                }
            }, {transaction: t, schema: 'public'});
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.dropTable({tableName: 'Model2', schema: 'public'}, {transaction: t});    
        await queryInterface.dropTable({tableName: 'Model3', schema: 'public'}, {transaction: t});
        await queryInterface.dropTable({tableName: 'Model1', schema: 'public'}, {transaction: t});
    }
    );},
};
  