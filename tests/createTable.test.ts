import {describe, expect, test} from '@jest/globals';
import { addMissingTablesToDb } from '../src/common/cmpFunctions';
import { Sequelize } from 'sequelize-typescript';
import { Item, Book, Person, AnotherItem, ArrayTypeModel, EnumTypeModel} from './testModels'
import { generateMigrationFile } from '../src/common/fileGen';
import { modelInfoType, generateModelsInfo } from '../src/common/modelsInfoGen';
import * as fs from 'fs' 
import * as path from 'path'

export const sequelize = new Sequelize({
    database: 'test',
    dialect: 'postgres',
    host: "localhost",
    username: 'postgres',
    password: '666666',
    models: [Item, Book, Person], 
    define: {
      freezeTableName: true,
    }
});

export const sequelize_types = new Sequelize({
  database: 'test',
  dialect: 'postgres',
  host: "localhost",
  username: 'postgres',
  password: '666666',
  models: [ArrayTypeModel, EnumTypeModel], 
  define: {
    freezeTableName: true,
  }
});

const testing_path_up = path.resolve(__dirname, "./createTableUpTestMirgation.js")
const testing_path_down = path.resolve(__dirname, "./createTableDownTestMigration.js")
const types_path_up = path.resolve(__dirname, "./createTableUpTypes.js")
const types_path_down = path.resolve(__dirname, "./createTableDownTypes.js")

describe('cmpTable module', () => {
  
  test('compare tables, one of them exists, checking schema property', async () => {
    const schema_info_tables = await sequelize.query("SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema!='pg_catalog' AND table_schema!='information_schema'")
    const schema_tables: Array<any> = schema_info_tables.at(0) as Array<any>;
    const tables: modelInfoType[] = generateModelsInfo(sequelize) as unknown as modelInfoType[];
    let {upString, downString} = addMissingTablesToDb(sequelize, schema_tables, tables);
    upString = upString.replace(/\s/g, "");
    downString = downString.replace(/\s/g, "")
    console.log()
    expect(upString).toBe(fs.readFileSync(testing_path_up).toString().replace(/\s/g, ""));
    expect(downString).toBe(fs.readFileSync(testing_path_down).toString().replace(/\s/g, ""))
  });
  test('compare tables, checking types', async () => {
    const schema_info_tables = await sequelize_types.query("SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema!='pg_catalog' AND table_schema!='information_schema'")
    const schema_tables: Array<any> = schema_info_tables.at(0) as Array<any>;
    const tables: modelInfoType[] = generateModelsInfo(sequelize_types) as unknown as modelInfoType[];
    let {upString, downString} = addMissingTablesToDb(sequelize_types, schema_tables, tables);
    upString = upString.replace(/\s/g, "");
    downString = downString.replace(/\s/g, "")
    console.log()
    expect(upString).toBe(fs.readFileSync(types_path_up).toString().replace(/\s/g, ""));
    expect(downString).toBe(fs.readFileSync(types_path_down).toString().replace(/\s/g, ""))
  })
});