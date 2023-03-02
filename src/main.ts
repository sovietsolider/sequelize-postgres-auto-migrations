import { QueryTypes } from 'sequelize';
import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull } from 'sequelize-typescript';
import { Sequelize } from 'sequelize-typescript';
import { compareTables, getModelByTableName, generateStringToAddTableBySchemaInfo } from './common/cmpFunctions';
import { Col, singularize } from 'sequelize/types/utils';
import { generateMigrationFile } from './common/fileGen';
import { generateModelsInfo } from './common/modelsInfoGen';
import { ArrayTypeModel, EnumTypeModel } from '../tests/testModels';
import { getPgColumnsInfo } from './common/queryParsingFun';
import { generateTableInfo } from './common/modelsInfoGen';
import * as fs from 'fs';

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
    //for(const v in sequelize.models)
    //    console.log(sequelize.models[v].getAttributes())
    //await sequelize_types.sync({ force: true });
    //console.log(await sequelize.query('SELECT enum_range(NULL::"enum_Book_name_enum");'));
    //let path = generateMigrationFile('add-new');
    //console.log(item.getAttributes())
    //await compareTables(sequelize, path);
})();
