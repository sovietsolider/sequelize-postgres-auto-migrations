module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.changeColumn({
                tableName: 'Model1',
                schema: 'public'
            }, 'model1Col2', {
                type: DataType.ARRAY(DataType.STRING(175)),
                allowNull: false,
                primaryKey: true,
            }, {
                transaction: t
            });
            await queryInterface.changeColumn({
                tableName: 'Model1',
                schema: 'public'
            }, 'model1Col3', {
                type: DataType.ARRAY(DataType.ARRAY(DataType.BOOLEAN)),
            }, {
                transaction: t
            });
            await queryInterface.removeColumn({
                tableName: 'Model1',
                schema: 'public'
            }, 'id', {
                transaction: t
            });
            await queryInterface.changeColumn({
                tableName: 'Model2',
                schema: 'public'
            }, 'model2Col1', {
                allowNull: false,
                primaryKey: true,
            }, {
                transaction: t
            });
            await queryInterface.changeColumn({
                tableName: 'Model2',
                schema: 'public'
            }, 'model2Fk', {
                allowNull: false,
                reference: {
                    model: {
                        tableName: 'Model1',
                        schema: 'public'
                    },
                    key: 'model1Col2'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            }, {
                transaction: t
            });
            await queryInterface.addColumn({
                tableName: 'Model2',
                schema: 'public'
            }, 'model2Fk2', {
                type: DataType.INTEGER,
                allowNull: true,
                name: model2Fk2,
                references: {
                    model: "Model3",
                    key: "id"
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            }, {
                transaction: t
            });
            await queryInterface.removeColumn({
                tableName: 'Model2',
                schema: 'public'
            }, 'id', {
                transaction: t
            });
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.changeColumn({
                tableName: 'Model1',
                schema: 'public'
            }, 'model1Col2', {
                type: DataType.ARRAY(DataType.STRING(1734)),
                allowNull: true,
                primaryKey: undefined,
            }, {
                transaction: t
            });
            await queryInterface.changeColumn({
                tableName: 'Model1',
                schema: 'public'
            }, 'model1Col3', {
                type: DataType.ARRAY(DataType.INTEGER),
            }, {
                transaction: t
            });
            await queryInterface.addColumn({
                tableName: 'Model1',
                schema: 'public'
            }, 'id', {
                type: DataType.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            }, );
            await queryInterface.changeColumn({
                tableName: 'Model2',
                schema: 'public'
            }, 'model2Col1', {
                allowNull: true,
                primaryKey: undefined,
            }, {
                transaction: t
            });
            await queryInterface.changeColumn({
                tableName: 'Model2',
                schema: 'public'
            }, 'model2Fk', {
                allowNull: true,
                reference: {
                    model: {
                        tableName: 'Model3',
                        schema: 'public'
                    },
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            }, {
                transaction: t
            });
            await queryInterface.removeColumn({
                tableName: 'Model2',
                schema: 'public'
            }, 'model2Fk2', {
                transaction: t
            });
            await queryInterface.addColumn({
                tableName: 'Model2',
                schema: 'public'
            }, 'id', {
                type: DataType.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            }, );
        });
    },
};