import {describe, expect, test} from '@jest/globals';
import { Sequelize } from 'sequelize-typescript';
import { Item, Book, Person, AnotherItem, ArrayTypeModel, EnumTypeModel} from './testModels'
import { FileService } from '../src/services/file.service';
import { compareTables } from '../src/common/cmpFunctions';
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
const final_cmp = path.resolve(__dirname, "./compareTablesTest.js")

describe('cmpTable module', () => {
  test('final comparison btw two tables (not including attributes)', async () => {
    let path_ = FileService.generateMigrationFile('add-new', '../');
    console.log(path_)
    await compareTables(sequelize, path_);
    expect(fs.readFileSync(`${path_}`).toString().replace(/\s/g, "")).toBe(fs.readFileSync(final_cmp).toString().replace(/\s/g, ""))
  })
});