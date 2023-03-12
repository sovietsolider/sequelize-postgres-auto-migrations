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

let test_models = [Model1, Model2, Model3];
let test1_models = [Book];
let test2_models = [Model1];
let res_path = path.resolve(__dirname, "./resMigrations/res.js");
let res_path_1 = path.resolve(__dirname, "./resMigrations/res_1.js");
let res_path_2 = path.resolve(__dirname, "./resMigrations/res_2.js");

const sequelize_test = new Sequelize({
  database: 'test',
  dialect: 'postgres',
  host: "localhost",
  username: 'postgres',
  password: '666666',
  models: [Model1, Model2, Model3], 
  define: {
    freezeTableName: true,
  }
});

const sequelize_test1 = new Sequelize({
  database: 'test1',
  dialect: 'postgres',
  host: "localhost",
  username: 'postgres',
  password: '666666',
  models: [], 
  define: {
    freezeTableName: true,
  }
});

const sequelize_test2 = new Sequelize({
  database: 'test2',
  dialect: 'postgres',
  host: "localhost",
  username: 'postgres',
  password: '666666',
  models: [], 
  define: {
    freezeTableName: true,
  }
});

describe('test case', () => {
  test('changing columns test', async () => { //test_1
    let path_ = FileService.generateMigrationFile("test", path.resolve(__dirname, "./migrationsToCompare"));
    path_ = path.resolve(__dirname, path_);
    await compareTables(sequelize_test, path_);
    expect(fs.readFileSync(`${path_}`).toString().replace(/\s/g, "")).toBe(fs.readFileSync(res_path).toString().replace(/\s/g, ""))
  });
  /*
  test('test case 1', async () => {
    let path_ = FileService.generateMigrationFile("test_1", path.resolve(__dirname, "./migrationsToCompare"));
    path_ = path.resolve(__dirname, path_);
    await compareTables(sequelize_test1, path_);
    expect(fs.readFileSync(`${path_}`).toString().replace(/\s/g, "")).toBe(fs.readFileSync(res_path_1).toString().replace(/\s/g, ""))
  });
  test('test case 2', async () => {
    let path_ = FileService.generateMigrationFile("test_2", path.resolve(__dirname, "./migrationsToCompare"));
    path_ = path.resolve(__dirname, path_);
    await compareTables(sequelize_test2, path_);
    expect(fs.readFileSync(`${path_}`).toString().replace(/\s/g, "")).toBe(fs.readFileSync(res_path_2).toString().replace(/\s/g, ""))
  })*/
});