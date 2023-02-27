await queryInterface.dropTable({ tableName: 'ArrayTypeModel', tableSchema: 'public'},{ transaction: t },);
await queryInterface.dropTable({ tableName: 'EnumTypeModel', tableSchema: 'public'},{ transaction: t },);
