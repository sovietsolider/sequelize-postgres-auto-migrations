import { AutoMigrations } from "./src/common/auto-migrations";
import { Sequelize } from "sequelize-typescript";
import { Model1 } from "./tests/testModels/model1";
import { DbService } from "./src/services/db.service";
import { Table, HasMany, ForeignKey, Model } from "sequelize-typescript";
import { WhereOptions } from "sequelize";
import { StringsGeneratorService } from "./src/services/stringsGenerator.service";
import { IndexModel, IndexModel2 } from "./tests/testModels/indexModel";
import { Model2 } from "./tests/testModels/model2";
import { Model3 } from "./tests/testModels/Model3";
import { Model4 } from "./tests/testModels/Model4";
import { ModelToAdd1 } from "./tests/testModels/modelToAdd1";

export const sequelize = new Sequelize({
    database: 'empty',
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '666666',
    models: [Model1, IndexModel, IndexModel2, Model2, Model4, Model3],
    define: {
        freezeTableName: true,
    },
    logging: false
});

//console.log(sequelize.models.Model3.getAttributes())
//sequelize.sync({force: true});
let auto_migrations = new AutoMigrations(sequelize);
auto_migrations.generateMigration('new', '/home/anatoliy/WORK/sequelize-migrations/migrations');