import { AutoMigrations } from "./src/common/auto-migrations";
import { Sequelize } from "sequelize-typescript";
import { Model1 } from "./tests/testModels/Model1";

export const sequelize = new Sequelize({
    database: 'empty',
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '666666',
    models: [Model1],
    define: {
        freezeTableName: true,
    },
    logging: false
});
//sequelize.sync({force: true})
let auto_migrations = new AutoMigrations(sequelize);
auto_migrations.generateMigration('new', './migrations');

