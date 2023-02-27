await queryInterface.dropTable({ tableName: 'Book', tableSchema: 'public'},{ transaction: t },);
await queryInterface.dropTable({ tableName: 'Person', tableSchema: 'public'},{ transaction: t },);