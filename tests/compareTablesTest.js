module.exports = {
	up: async(queryInterface, Sequelize) => {
		await queryInterface.sequelize.transaction(async(t) => {
			await queryInterface.createTable("Book", {
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
				name: {
					type: DataType.STRING(176),
				},
				name_array: {
					type: DataType.ARRAY(DataType.ARRAY(DataType.ARRAY(DataType.STRING(70)))),
				},
				nameE: {
					type: DataType.ENUM('ONE', 'TWO', 'THREE'),
				},
				proofreaderId: {
					type: DataType.SMALLINT,
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
			}, {
				transaction: t,
				schema: "public"
			}, );
			await queryInterface.createTable("Person", {
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
			}, {
				transaction: t,
				schema: "public"
			}, );
			await queryInterface.dropTable({
				tableName: 'ArrayTypeModel',
				tableSchema: 'public'
			}, {
				transaction: t
			}, );
			await queryInterface.dropTable({
				tableName: 'EnumTypeModel',
				tableSchema: 'public'
			}, {
				transaction: t
			}, );
		});
	},
	down: async(queryInterface, Sequelize) => {
		await queryInterface.sequelize.transaction(async(t) => {
			await queryInterface.dropTable({
				tableName: 'Book',
				tableSchema: 'public'
			}, {
				transaction: t
			}, );
			await queryInterface.dropTable({
				tableName: 'Person',
				tableSchema: 'public'
			}, {
				transaction: t
			}, );
			await queryInterface.createTable("ArrayTypeModel", {
				id: {
					type: DataType.INTEGER,
					autoIncrement: true,
					allowNull: false,
					primaryKey: true,
				},
				names_array: {
					type: DataType.ARRAY(DataType.STRING(259)),
					allowNull: false,
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
			await queryInterface.createTable("EnumTypeModel", {
				id: {
					type: DataType.INTEGER,
					autoIncrement: true,
					allowNull: false,
					primaryKey: true,
				},
				names_enum: {
					type: DataType.ARRAY(DataType.ARRAY(DataType.INTEGER)),
					allowNull: false,
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
};