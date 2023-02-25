module.exports = {
 up: async (queryInterface, Sequelize) => {
await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.createTable(
        "book",
        {
            id: { 
                type: DataType.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: { 
                type: DataType.STRING,
            },
        },{ transaction: t},
    );
    await queryInterface.createTable("Person",{id: { type: DataType.INTEGER,autoIncrement: true,primaryKey: true,},name: { type: DataType.STRING,},},{ transaction: t},);await queryInterface.createTable("Item",{id: { type: DataType.INTEGER,autoIncrement: true,primaryKey: true,},name: { type: DataType.STRING,},},{ transaction: t},);