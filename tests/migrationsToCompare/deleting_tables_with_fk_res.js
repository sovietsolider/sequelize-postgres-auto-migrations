module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.dropTable({
                tableName: 'Model3',
                schema: 'public'
            }, {
                cascade: true,
                transaction: t
            });
            await queryInterface.dropTable({
                tableName: 'Model2',
                schema: 'public'
            }, {
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
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.createTable({
                tableName: 'Model3',
                schema: 'public'
            }, {
                model3Col1: {
                    "type": Sequelize.INTEGER,
                    "allowNull": false,
                    "primaryKey": true
                },
                createdAt: {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                updatedAt: {
                    "type": Sequelize.DATE,
                    "allowNull": false
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
                    "type": Sequelize.INTEGER,
                    "autoIncrement": true,
                    "allowNull": false,
                    "primaryKey": true
                },
                col2: {
                    "type": Sequelize.INTEGER,
                    "allowNull": true
                },
                check_index: {
                    "type": Sequelize.INTEGER,
                    "allowNull": true
                },
                createdAt: {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                updatedAt: {
                    "type": Sequelize.DATE,
                    "allowNull": false
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
                    "type": Sequelize.INTEGER,
                    "allowNull": false,
                    "primaryKey": true
                },
                fk3: {
                    "type": Sequelize.INTEGER,
                    "allowNull": true,
                    "references": {
                        "model": {
                            "tableName": "Model3",
                            "schema": "public"
                        },
                        "key": "model3Col1"
                    },
                    "onUpdate": "CASCADE",
                    "onDelete": "NO ACTION"
                },
                fk1: {
                    "type": Sequelize.INTEGER,
                    "allowNull": true,
                    "references": {
                        "model": {
                            "tableName": "Model1",
                            "schema": "public"
                        },
                        "key": "col1"
                    },
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE"
                },
                createdAt: {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                updatedAt: {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
            }, {
                transaction: t,
                schema: 'public'
            });
        });
    },
};