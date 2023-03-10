module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.createTable("Book", {
                authorsFullNames: {
                    type: DataType.TEXT,
                },
                authorsShortNames: {
                    type: DataType.TEXT,
                },
                libDescription: {
                    type: DataType.TEXT,
                },
                cipher: {
                    type: DataType.STRING(255),
                },
                title: {
                    type: DataType.TEXT,
                },
                publisher: {
                    type: DataType.STRING(255),
                },
                year: {
                    type: DataType.INTEGER,
                },
                count: {
                    type: DataType.INTEGER,
                },
                mfn: {
                    type: DataType.INTEGER,
                    primaryKey: true,
                },
                urls: {
                    type: DataType.JSONB,
                },
                db: {
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
            await queryInterface.dropTable({
                tableName: 'Model1',
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
            await queryInterface.dropTable({
                tableName: 'Model3',
                tableSchema: 'public'
            }, {
                transaction: t
            }, );
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.dropTable({
                tableName: 'Book',
                tableSchema: 'public'
            }, {
                transaction: t
            }, );
            await queryInterface.createTable("Model1", {
                id: {
                    "type": DataType.INTEGER,
                    "autoIncrement": true,
                    "allowNull": false,
                    "primaryKey": true
                },
                model1Col1: {
                    "type": DataType.INTEGER,
                    "allowNull": true
                },
                model1Col2: {
                    "type": DataType.INTEGER,
                    "allowNull": true
                },
                model1Col3: {
                    "type": DataType.ARRAY(DataType.INTEGER),
                    "allowNull": true
                },
                createdAt: {
                    "type": DataType.DATE,
                    "allowNull": false
                },
                updatedAt: {
                    "type": DataType.DATE,
                    "allowNull": false
                },
            }, {
                transaction: t,
                schema: "public"
            }, );
            await queryInterface.createTable("Model2", {
                id: {
                    "type": DataType.INTEGER,
                    "autoIncrement": true,
                    "allowNull": false,
                    "primaryKey": true
                },
                model2Col1: {
                    "type": DataType.STRING(255),
                    "allowNull": true
                },
                model2Col2: {
                    "type": DataType.ENUM('1', '2', '3', ),
                    "allowNull": true
                },
                createdAt: {
                    "type": DataType.DATE,
                    "allowNull": false
                },
                updatedAt: {
                    "type": DataType.DATE,
                    "allowNull": false
                },
                model2Fk: {
                    "type": DataType.INTEGER,
                    "allowNull": true,
                    "reference": {
                        "model": {
                            "tableName": "Model1",
                            "schema": "public"
                        },
                        "key": "id"
                    },
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL"
                },
            }, {
                transaction: t,
                schema: "public"
            }, );
            await queryInterface.createTable("Model3", {
                id: {
                    "type": DataType.INTEGER,
                    "autoIncrement": true,
                    "allowNull": false,
                    "primaryKey": true
                },
                createdAt: {
                    "type": DataType.DATE,
                    "allowNull": false
                },
                updatedAt: {
                    "type": DataType.DATE,
                    "allowNull": false
                },
            }, {
                transaction: t,
                schema: "public"
            }, );
        });
    },
};