module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.changeColumn({
                tableName: 'Model1',
                schema: 'public'
            }, 'model1Col1', {
                type: DataType.STRING(255),
            }, {
                transaction: t
            });
            await queryInterface.changeColumn({
                tableName: 'Model1',
                schema: 'public'
            }, 'model1Col2', {
                type: DataType.ARRAY(DataType.STRING(175)),
            }, {
                transaction: t
            });
            await queryInterface.changeColumn({
                tableName: 'Model2',
                schema: 'public'
            }, 'model2Col2', {
                type: DataType.ENUM('5', '2', '1'),
            }, {
                transaction: t
            });
            await queryInterface.addColumn({
                tableName: 'Model3',
                schema: 'public'
            }, 'idd', {
                type: DataType.INTEGER,
            }, {
                transaction: t
            });
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.changeColumn({
                tableName: 'Model1',
                schema: 'public'
            }, 'model1Col1', {
                type: DataType.INTEGER,
            }, {
                transaction: t
            });
            await queryInterface.changeColumn({
                tableName: 'Model1',
                schema: 'public'
            }, 'model1Col2', {
                type: DataType.INTEGER,
            }, {
                transaction: t
            });
            await queryInterface.changeColumn({
                tableName: 'Model2',
                schema: 'public'
            }, 'model2Col2', {
                type: DataType.ENUM('1', '2', '3', ),
            }, {
                transaction: t
            });
            await queryInterface.removeColumn({
                tableName: 'Model3',
                schema: 'public'
            }, 'idd', {
                transaction: t
            });
        });
    },
};