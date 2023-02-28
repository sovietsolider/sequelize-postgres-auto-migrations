import { QueryTypes } from 'sequelize';
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
} from 'sequelize-typescript';
import { Sequelize } from 'sequelize-typescript';
import {
    compareTables,
    getModelByTableName,
    generateStringToAddTableBySchemaInfo,
} from './common/cmpFunctions';
import { Col, singularize } from 'sequelize/types/utils';
import { generateMigrationFile } from './common/fileGen';
import { generateModelsInfo } from './common/modelsInfoGen';
import { ArrayTypeModel, EnumTypeModel } from '../tests/testModels';
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

    @ForeignKey(() => Person)
    @Column
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
    @Column
    id!: number;

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
    //await sequelize.sync({force:true})
    let path = generateMigrationFile('add-new');
    //console.log(item.getAttributes())
    compareTables(sequelize, path);
})();
