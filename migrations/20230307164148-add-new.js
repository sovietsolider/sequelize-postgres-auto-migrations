module.exports = {
        up: async (queryInterface, Sequelize) => {
            await queryInterface.sequelize.transaction(async (t) => {
                await queryInterface.changeColumn({
                    tableName: 'Player',
                    schema: 'public'
                }, 'teamId', {
                    allowNull: true,
                    reference: {
                        model: {
                            tableName: 'Item',
                            schema: 'public'
                        },
                        key: 'name'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'NO ACTION',
                }, );
                await queryInterface.changeColumn({
                    tableName: 'Team',
                    schema: 'public'
                }, 'name', {
                    defaultValue: 'fd',
                }, );
                await queryInterface.addColumn({
                    tableName: 'Team',
                    schema: 'public'
                }, 'newAttribute', {
                    id: {
                        type: DataType.INTEGER,
                        allowNull: false,
                        primaryKey: true,
                        autoIncrement: true,
                    },
                    name: {
                        type: DataType.STRING(255),
                        defaultValue: fd,
                    },
                    newAttribute: {
                        type: DataType.INTEGER,
                    },
                    createdAt: {
                        type: DataType.DATE,
                        allowNull: false,
                    },
                    updatedAt: {
                        type: DataType.DATE,
                        allowNull: false,
                    },
                }, );
                await queryInterface.changeColumn({
                    tableName: 'Item',
                    schema: 'public'
                }, 'name', {
                    type: DataType.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                }, );
                await queryInterface.removeColumn({
                    tableName: 'Item',
                    schema: 'public'
                }, 'id', {
                    transaction: t
                });
            });
        },
        down: async (queryInterface, Sequelize) => {
            await queryInterface.sequelize.transaction(async (t) => {
                    await queryInterface.changeColumn({
                        tableName: 'Player',
                        schema: 'public'
                    }, 'teamId', {
                        allowNull: undefined,
                        reference: {
                            model: {
                                tableName: 'Team',
                                schema: 'public'
                            },
                            key: 'id'
                        },
                        onUpdate: 'CASCADE',
                        onDelete: 'NO ACTION',
                    }, );
                    await queryInterface.changeColumn({
                        tableName: 'Team',
                        schema: 'public'
                    }, 'name', {
                        defaultValue: undefined,
                    }, );
                    await queryInterface.removeColumn({
                        tableName: 'Team',
                        schema: 'public'
                    }, 'newAttribute', {
                        transaction: t
                    });
                    await queryInterface.changeColumn({
                        tableName: 'Item',
                        schema: 'public'
                    }, 'name', {
                        type: DataType.STRING(255),
                        autoIncrement: undefined,
                        primaryKey: undefined,
                    }, );
                    await queryInterface.addColumn({
                            tableName: 'Item',
                            schema: 'public'
                        }, 'id', {
                            type: DataType.INTEGER,
                            autoIncrement: true,
                            allowNull: false,
                            primaryKey: true,
                        },
                    });
            },
        };