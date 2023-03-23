import { AutoMigrations } from "./src/common/auto-migrations";
import { Sequelize } from "sequelize-typescript";
import { Model1 } from "./tests/testModels/model1";
import { Model2 } from "./tests/testModels/model2";
import { Model3 } from "./tests/testModels/model3";
import { DbService } from "./src/services/db.service";
import { Table, HasMany, ForeignKey, Model } from "sequelize-typescript";
import { WhereOptions } from "sequelize";
import { StringsGeneratorService } from "./src/services/stringsGenerator.service";

export const sequelize = new Sequelize({
    database: 'empty',
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '666666',
    models: [Model1, Model3, Model2],
    define: {
        freezeTableName: true,
    },
});

/*const symbolKey = Reflect.ownKeys(sequelize.models.Model1.options.indexes?.at(0)?.where as any)
  .find(key => key.toString() === 'Symbol(or)')*/
  
/*console.log((sequelize.models.Model1.options.indexes?.at(0)?.where as any)[symbolKey as string][0]); // 42
console.log(sequelize.models.Model1.options.indexes?.at(0)?.where)*/
//sequelize.sync({force: true});
const auto_migrations = new AutoMigrations(sequelize);
auto_migrations.generateMigration('new', '/home/anatoliy/WORK/sequelize-migrations/migrations')