import { AutoMigrations } from "./src/common/auto-migrations";
import { Sequelize } from "sequelize-typescript";
import { DbService } from "./src/services/db.service";
import { Table, HasMany, ForeignKey, Model } from "sequelize-typescript";
import { WhereOptions } from "sequelize";
import { StringsGeneratorService } from "./src/services/stringsGenerator.service";
import { IndexModel, IndexModel2 } from "./tests/testModels/indexModel";
import { Model2 } from "./tests/testModels/Model2";
import { Model1 } from "./tests/testModels/Model1";
import { Model3 } from "./tests/testModels/Model3";

export const sequelize = new Sequelize({
    database: 'empty',
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '666666',
    models: [/*Model1, Model2, Model3*/],
    define: {
        freezeTableName: true,
    },
    logging: false
});

//console.log(sequelize.models.Model1.getAttributes())
//sequelize.sync({force: true});
let auto_migrations = new AutoMigrations(sequelize);
auto_migrations.generateMigration('new', '/home/anatoliy/WORK/sequelize-migrations/migrations');