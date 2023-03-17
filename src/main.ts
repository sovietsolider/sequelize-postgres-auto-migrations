import {
    Table,
    Column,
    Model,
    HasMany,
    DataType,
    PrimaryKey,
    AutoIncrement,
    BelongsTo,
    ForeignKey,
    AllowNull,
    Default,
    HasOne,
} from 'sequelize-typescript';
import { Sequelize } from 'sequelize-typescript';
import { compareTables } from './common/cmpFunctions';
//import { ArrayTypeModel, EnumTypeModel } from '../tests/testModels';
import { FileService } from './services/file.service';
import { DbService } from './services/db.service';
import { Model1 } from '../tests/testModels/model1';
import { Model2 } from '../tests/testModels/model2';
import { Model3 } from '../tests/testModels/model3';

export const sequelize = new Sequelize({
    database: 'test',
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '666666',
    models: [Model1, Model2, Model3],
    define: {
        freezeTableName: true,
    },
});

(async () => {
    //console.log(sequelize.models.Player.getAttributes())
    //console.log(sequelize.models.Team.getAttributes())
    //console.log(await DbService.tableToModelInfo(sequelize, 'public', 'Team'))
    //await sequelize.sync({ force: true });
    //console.log(sequelize.models.Item.getAttributes())
    //console.log(JSON.stringify(await DbService.tableToModelInfo(sequelize, 'public', 'Book')))
    //let path = FileService.generateMigrationFile('add-new', '../migrations');
    //await compareTables(sequelize, path);
})();
