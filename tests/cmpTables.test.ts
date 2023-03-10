import {describe, expect, test} from '@jest/globals';
import { Sequelize } from 'sequelize-typescript';
import { Model1 } from './testModels/model1'
import { Model2 } from './testModels/model2';
import { Model3 } from './testModels/model3';
import { Book } from './testModels/modelToAdd1';
import { FileService } from '../src/services/file.service';
import { compareTables } from '../src/common/cmpFunctions';
import * as fs from 'fs' 
import * as path from 'path'

let changing_columns_test_models = [Model1, Model2, Model3]
let adding_table_test_models = [Book]
let changing_columns_res_path = path.resolve(__dirname, "./migrationsToCompare/changing_test.js")
let adding_columns_res_path = path.resolve(__dirname, "./migrationsToCompare/adding_test.js")

export const sequelize = new Sequelize({
    database: 'test',
    dialect: 'postgres',
    host: "localhost",
    username: 'postgres',
    password: '666666',
    models: adding_table_test_models, 
    define: {
      freezeTableName: true,
    }
});


describe('cmpTable module', () => {
  test('changing columns test', async () => { //test_1
    let path_ = FileService.generateMigrationFile("test_1", path.resolve(__dirname, "./migrationsToCompare"));
    path_ = path.resolve(__dirname, path_);
    await compareTables(sequelize, path_);
    expect(fs.readFileSync(`${path_}`).toString().replace(/\s/g, "")).toBe(fs.readFileSync(changing_columns_res_path).toString().replace(/\s/g, ""))
  });
  test('adding tables', async () => {
    let path_ = FileService.generateMigrationFile("test_2", path.resolve(__dirname, "./migrationsToCompare"));
    path_ = path.resolve(__dirname, path_);
    await compareTables(sequelize, path_);
    expect(fs.readFileSync(`${path_}`).toString().replace(/\s/g, "")).toBe(fs.readFileSync(adding_columns_res_path).toString().replace(/\s/g, ""))
  })
});