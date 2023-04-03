import { Sequelize, Model, ModelCtor, addFieldToIndex } from 'sequelize-typescript';
import { sqlToSeqTypes, SchemaColumns, TableToModel } from './interfaces';
import { DbService } from '../services/db.service';
import { ModelService } from '../services/model.service';
import { modelInfoType } from './interfaces';
import { FileService } from '../services/file.service';
import { StringsGeneratorService } from '../services/stringsGenerator.service';
import * as beautifier from 'js-beautify';
import { MigrationOptions } from './interfaces';

export async function compareTables(sequelize: Sequelize, pathToMigrationFile: string) {}
