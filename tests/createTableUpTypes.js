await queryInterface.createTable(
    "ArrayTypeModel",{
        id: { 
            type: DataType.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
            names_array: { 
                type: DataType.ARRAY(DataType.STRING(255)), 
            },createdAt: { 
                type: DataType.DATE,
                allowNull: false,
            },updatedAt: { 
                type: DataType.DATE,
                allowNull: false,
            },
        },{ transaction: t, schema: "public"},);
await queryInterface.createTable(
    "EnumTypeModel",{
        id: { 
            type: DataType.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },names_enum: { 
            type: DataType.ENUM({ values: ["ONE","TWO","THREE"]})},
            createdAt: { type: DataType.DATE, allowNull: false,},
            updatedAt: { type: DataType.DATE,allowNull: false,},
        },{ transaction: t, schema: "public"},
);