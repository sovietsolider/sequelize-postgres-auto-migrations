import {describe, expect, test} from '@jest/globals';
import { Sequelize } from 'sequelize-typescript';
import { FileService } from '../src/services/file.service';
import { compareTables } from '../src/common/cmpFunctions';
import { sequelize_adding_tables_test } from './testSequelizes/sequelizes';
import * as fs from 'fs' 
import * as path from 'path'

let adding_tables_test_res = path.resolve(__dirname, "./migrationsToCompare/adding_tables_test_res.js");

describe('Adding/Deleting tables', () => {
  test('Add table with schema and all properties', async () => {
    let path_ = FileService.generateMigrationFile("test", path.resolve(__dirname, "../migrations"));
    path_ = path.resolve(__dirname, path_);
    await compareTables(sequelize_adding_tables_test, path_);
    expect(fs.readFileSync(`${path_}`).toString().replace(/\s/g, "")).toBe(fs.readFileSync(adding_tables_test_res).toString().replace(/\s/g, ""))
  });
});