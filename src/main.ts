import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, Default, HasOne } from 'sequelize-typescript';
import { Sequelize } from 'sequelize-typescript';
import { compareTables } from './common/cmpFunctions';
//import { ArrayTypeModel, EnumTypeModel } from '../tests/testModels';
import { FileService } from './services/file.service';
import { DbService } from './services/db.service';

@Table
class Team extends Model {
    @Default(['1', '2'])
    @Column(DataType.ARRAY(DataType.STRING))
    name!: string[][];

    @Default('5')
    @Column
    newAttribute!: string;

    //@HasMany(() => Player)
    //players!: Player[];
}

@Table
class Item extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    name!: number;

    //@HasMany(() => Player)
    //players!: Player[];
}

@Table
class Player extends Model {
    @Column
    name!: string;

    @Column({ field: 'blob_1' })
    num!: number;

    //@ForeignKey(() => Item)
    @Column
    teamId!: number;

    //@BelongsTo(() => Item)
    //team!: Item;
}

@Table
class NewModel extends Model {
  @Column
  newName!: string;
}

export const sequelize = new Sequelize({
    database: 'test',
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '666666',
    models: [Player, Team, Item, NewModel],
    define: {
        freezeTableName: true,
    },
});


(async () => {
    console.log(sequelize.models.Player.getAttributes())
    //console.log(sequelize.models.Team.getAttributes())

    //console.log(await DbService.tableToModelInfo(sequelize, 'public', 'Team'))
   // await sequelize.sync({ force: true });
    //console.log(sequelize.models.Item.getAttributes())
    //console.log(JSON.stringify(await DbService.tableToModelInfo(sequelize, 'public', 'Book')))
    //let path = FileService.generateMigrationFile('add-new', '../migrations');
    //await compareTables(sequelize, path);
})();
