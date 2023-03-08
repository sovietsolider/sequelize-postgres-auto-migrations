module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.changeColumn({
                tableName: 'Team',
                schema: 'public'
            }, 'name', {
                type: DataType.ARRAY(DataType.STRING(255)),
                defaultValue: ["1", "2"],
            }, );
            await queryInterface.changeColumn({
                tableName: 'Team',
                schema: 'public'
            }, 'newAttribute', {
                defaultValue: "5",
            }, );
            await queryInterface.changeColumn({
                tableName: 'Item',
                schema: 'public'
            }, 'name', {
                allowNull: undefined,
            }, );
            await queryInterface.createTable("NewModel", {
                id: {
                    type: DataType.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                },
                newName: {
                    type: DataType.STRING(255),
                },
                createdAt: {
                    type: DataType.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: DataType.DATE,
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
            await queryInterface.changeColumn({
                tableName: 'Team',
                schema: 'public'
            }, 'name', {
                type: DataType.ARRAY(DataType.STRING(259)),
                defaultValue: ['1', '2'],
            }, );
            await queryInterface.changeColumn({
                tableName: 'Team',
                schema: 'public'
            }, 'newAttribute', {
                defaultValue: '5',
            }, );
            await queryInterface.changeColumn({
                tableName: 'Item',
                schema: 'public'
            }, 'name', {
                allowNull: false,
            }, );
            await queryInterface.dropTable({
                tableName: 'NewModel',
                tableSchema: 'public'
            }, {
                transaction: t
            }, );
        });
    },
};