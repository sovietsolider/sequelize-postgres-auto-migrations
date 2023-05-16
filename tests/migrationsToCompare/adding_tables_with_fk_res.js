module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.createTable({
                tableName: 'Model3',
                schema: 'public'
            }, {
                model3Col1: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    allowNull: false,
                },
            }, {
                transaction: t,
                schema: 'public'
            });
            await queryInterface.createTable({
                tableName: 'Model1',
                schema: 'public'
            }, {
                col1: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                col2: {
                    type: Sequelize.INTEGER,
                },
                check_index: {
                    type: Sequelize.INTEGER,
                },
            }, {
                transaction: t,
                schema: 'public'
            });
            await queryInterface.createTable({
                tableName: 'Model2',
                schema: 'public'
            }, {
                pk: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                },
                fk3: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'Model3',
                        key: 'model3Col1'
                    },
                    onDelete: "NO ACTION",
                    onUpdate: "CASCADE",
                },
                fk1: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'Model1',
                        key: 'col1'
                    },
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                },
            }, {
                transaction: t,
                schema: 'public'
            });
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.dropTable({
                tableName: 'Model2',
                schema: 'public'
            }, {
                transaction: t
            });
            await queryInterface.dropTable({
                tableName: 'Model3',
                schema: 'public'
            }, {
                cascade: true,
                transaction: t
            });
            await queryInterface.dropTable({
                tableName: 'Model1',
                schema: 'public'
            }, {
                cascade: true,
                transaction: t
            });
        });
    },
};