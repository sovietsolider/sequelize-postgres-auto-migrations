import { AutoMigrations } from "./src/common/auto-migrations";
import { Sequelize } from "sequelize-typescript";
import { Model1 } from "./tests/testModels/model1";
import { DbService } from "./src/services/db.service";
import { Table, HasMany, ForeignKey, Model } from "sequelize-typescript";
import { WhereOptions } from "sequelize";
import { StringsGeneratorService } from "./src/services/stringsGenerator.service";
import { IndexModel, IndexModel2 } from "./tests/testModels/indexModel";

export const sequelize = new Sequelize({
    database: 'empty',
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '666666',
    models: [Model1, IndexModel, IndexModel2],
    define: {
        freezeTableName: true,
    },
});


//sequelize.sync({force: true});
const auto_migrations = new AutoMigrations(sequelize);
auto_migrations.generateMigration('new', '/home/anatoliy/WORK/sequelize-migrations/migrations')