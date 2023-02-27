await queryInterface.createTable(
    "Book",{ 
        id: { 
            type: DataType.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        authorId: { 
            type: DataType.INTEGER,
            allowNull: true,
            name: authorId,
            references: { 
                model: "Person", 
                key: "id"
            },
            onDelete: "NO ACTION",
            onUpdate: "CASCADE",
        },
        proofreaderId: { 
            type: DataType.INTEGER,
            allowNull: true,
            name: proofreaderId,
            references: { 
                model: "Person", 
                key: "id"
            },
            onDelete: "NO ACTION",
            onUpdate: "CASCADE",
        },
        createdAt: { 
            type: DataType.DATE,
            allowNull: false,
        },
        updatedAt: { 
            type: DataType.DATE,
            allowNull: false,
        },
    },{ transaction: t, schema: "public"},
);
await queryInterface.createTable(
    "Person",{
        id: { 
            type: DataType.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        createdAt: { 
            type: DataType.DATE,
            allowNull: false,
        },
        updatedAt: { 
            type: DataType.DATE,
            allowNull: false,
        },
    },{ transaction: t, schema: "public"},
);