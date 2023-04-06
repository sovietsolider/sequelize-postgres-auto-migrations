import { AutoMigrations } from "./src/common/auto-migrations";
import { Sequelize } from "sequelize-typescript";
import { Model1 } from "./tests/testModels/Model1";
import { Model2 } from "./tests/testModels/Model2";
import { Model3 } from "./tests/testModels/Model3";
import { Model4 } from "./tests/testModels/Model4";
import { ModelToAdd1 } from "./tests/testModels/ModelToAdd1";

export const sequelize = new Sequelize({
    database: 'empty',
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '666666',
    models: [],
    define: {
        freezeTableName: true,
    },
    logging: false
});
let auto_migrations = new AutoMigrations(sequelize);
auto_migrations.generateMigration('new', './migrations');

