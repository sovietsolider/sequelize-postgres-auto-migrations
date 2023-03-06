import { Sequelize, Model, ModelCtor } from 'sequelize-typescript';
import { sqlToSeqTypes, SchemaColumns, TableToModel } from './interfaces';
import { DbService } from '../services/db.service';
import { ModelService } from '../services/model.service';
import { modelInfoType } from './interfaces';
import { FileService } from '../services/file.service';
import { StringsGeneratorService } from '../services/stringsGenerator.service';

export async function compareTablesAttributes(sequelize: Sequelize, table_schema: string, table_name: string) {
}

export async function compareTables(sequelize: Sequelize, pathToMigrationFile: string) {
    const schema_info_tables = await sequelize.query("SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema!='pg_catalog' AND table_schema!='information_schema'");
    const schema_tables: Array<any> = schema_info_tables.at(0) as Array<any>;
    const tables: modelInfoType[] = ModelService.generateModelsInfo(sequelize) as unknown as modelInfoType[];
    //console.log(schema_tables);
    //console.log(tables);
    let add_strings: { upString: string; downString: string } = await DbService.addMissingTablesToDb(sequelize, schema_tables, tables);
    FileService.writeToMigrationFile(pathToMigrationFile, add_strings.upString);
    
    let delete_string: { upString: string; downString: string } = await DbService.deleteMissingTablesFromDb(sequelize, schema_tables, tables);
    FileService.writeToMigrationFile(pathToMigrationFile, delete_string.upString);
    FileService.writeToMigrationFile(pathToMigrationFile, '});},')
    FileService.writeToMigrationFile(pathToMigrationFile, 'down: async (queryInterface, Sequelize) => {await queryInterface.sequelize.transaction(async (t) => {')
    FileService.writeToMigrationFile(pathToMigrationFile, add_strings.downString);
    FileService.writeToMigrationFile(pathToMigrationFile, delete_string.downString);
    FileService.writeToMigrationFile(pathToMigrationFile, '});},};')
}
