module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.createTable("Model1", {
                model1Col2: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                },
                model1Col3: {
                    type: Sequelize.ARRAY(Sequelize.ARRAY(Sequelize.STRING(255))),
                },
                new_model1_field: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
            }, {
                transaction: t,
                schema: "public"
            }, );
            await queryInterface.createTable("Model3", {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                },
                idd: {
                    type: Sequelize.INTEGER,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
            }, {
                transaction: t,
                schema: "public"
            }, );
            await queryInterface.createTable("Model2", {
                model2Col1: {
                    type: Sequelize.STRING(101),
                    primaryKey: true,
                },
                model2Col2: {
                    type: Sequelize.ENUM('one', 'two', 'three', ),
                },
                model2Fk: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: "Model1",
                        key: "model1Col2"
                    },
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                },
                model2Fk2: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: "Model3",
                        key: "id"
                    },
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
            }, {
                transaction: t,
                schema: "public"
            }, );
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.dropTable({
                tableName: 'Model1',
                tableSchema: 'public'
            }, {
                transaction: t
            }, );
            await queryInterface.dropTable({
                tableName: 'Model3',
                tableSchema: 'public'
            }, {
                transaction: t
            }, );
            await queryInterface.dropTable({
                tableName: 'Model2',
                tableSchema: 'public'
            }, {
                transaction: t
            }, );
        });
    },
};