import { AutoMigrations } from "./src/common/auto-migrations";
import { Sequelize } from "sequelize-typescript";
import { Item, Book, Person } from "./tests/testModels/model1";
export const sequelize = new Sequelize({
    database: 'test',
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '666666',
    models: [Item, Book, Person],
    define: {
        freezeTableName: true,
    },
});
const auto_migrations = new AutoMigrations(sequelize);
auto_migrations.generateMigration('new', './migrations/')