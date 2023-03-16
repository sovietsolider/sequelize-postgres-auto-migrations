import { AutoMigrations } from "./src/common/auto-migrations";
import { Sequelize } from "sequelize-typescript";
import { Model1 } from "./tests/testModels/model1";
import { Model2 } from "./tests/testModels/model2";
import { Model3 } from "./tests/testModels/model3";
import { DbService } from "./src/services/db.service";
import { Table, HasMany, ForeignKey, Model } from "sequelize-typescript";
import { Model4 } from "./tests/testModels/model4";

export const sequelize = new Sequelize({
    database: 'test',
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '666666',
    models: [Model1,Model2, Model3],
    define: {
        freezeTableName: true,
    },
});

//console.log(sequelize.models.Model1.getAttributes())
//sequelize.sync({force: true});
const auto_migrations = new AutoMigrations(sequelize);
auto_migrations.generateMigration('new', '/home/anatoliy/WORK/sequelize-migrations/migrations')