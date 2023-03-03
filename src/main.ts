import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull } from 'sequelize-typescript';
import { Sequelize } from 'sequelize-typescript';
import { compareTables, compareTablesAttributes } from './common/cmpFunctions';
import { ArrayTypeModel, EnumTypeModel } from '../tests/testModels';
import { FileService } from './services/file.service';

@Table
class Person extends Model {
    @HasMany(() => Book, 'authorId')
    writtenBooks!: Book[];

    @HasMany(() => Book, 'proofreaderId')
    proofedBooks!: Book[];
}

@Table
class Book extends Model {
    @ForeignKey(() => Person)
    @Column
    authorId!: number;

    @Column(DataType.STRING(176))
    name!: string;

    @Column(DataType.ARRAY(DataType.ARRAY(DataType.ARRAY(DataType.STRING(70)))))
    name_array!: string[][][];

    @Column(DataType.ENUM("ONE", "TWO", "THREE",))
    nameE!: string[]

    @ForeignKey(() => Person)
    @Column(DataType.SMALLINT)
    proofreaderId!: number;

    @BelongsTo(() => Person, 'authorId')
    author!: Person;

    @BelongsTo(() => Person, 'proofreaderId')
    proofreader!: Person;
}

@Table({ schema: 'temp' })
class Item extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(true)
    @Column
    id!: number;

    @PrimaryKey
    @Column
    name!: string;
}

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

export const sequelize_types = new Sequelize({
    database: 'test',
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '666666',
    models: [ArrayTypeModel, EnumTypeModel],
    define: {
        freezeTableName: true,
    },
});

(async () => {
    //await sequelize.sync({ force: true });
    let path = FileService.generateMigrationFile('add-new', '../migrations');
    //await compareTables(sequelize_types, path);
})();
