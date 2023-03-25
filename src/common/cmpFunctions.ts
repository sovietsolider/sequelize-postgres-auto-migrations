import { Sequelize, Model, ModelCtor, addFieldToIndex } from 'sequelize-typescript';
import { sqlToSeqTypes, SchemaColumns, TableToModel } from './interfaces';
import { DbService } from '../services/db.service';
import { ModelService } from '../services/model.service';
import { modelInfoType } from './interfaces';
import { FileService } from '../services/file.service';
import { StringsGeneratorService } from '../services/stringsGenerator.service';
import * as beautifier from 'js-beautify';
import { MigrationOptions } from './interfaces';

export async function compareTables(sequelize: Sequelize, pathToMigrationFile: string) {
    const schema_info_tables = await sequelize.query(
        "SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema!='pg_catalog' AND table_schema!='information_schema'",
    );
    const schema_tables: Array<any> = schema_info_tables.at(0) as Array<any>;
    const tables: modelInfoType[] = ModelService.generateModelsInfo(
        sequelize,
    ) as unknown as modelInfoType[];
    //console.log(schema_tables);
    //console.log(tables);
    let add_strings: { upString: string; downString: string, addIndexesDownString: string[] } =
        await DbService.addMissingTablesToDb(sequelize, schema_tables, tables); //adding tables
    let delete_string: { upString: string; downString: string } =
        await DbService.deleteMissingTablesFromDb(sequelize, schema_tables, tables); //deleting tables

    let final_string =
        'module.exports = { up: async (queryInterface, Sequelize) => {await queryInterface.sequelize.transaction(async (t) => {';
    final_string += add_strings.upString;
    final_string += delete_string.upString;
    final_string +=
        '});},down: async (queryInterface, Sequelize) => {await queryInterface.sequelize.transaction(async (t) => {';
    final_string += add_strings.downString;
    final_string += add_strings.addIndexesDownString;
    console.log("DAUN")
    console.log(add_strings.addIndexesDownString)
    final_string += delete_string.downString;
    final_string += '});},};';
    final_string = beautifier.js_beautify(final_string); 
    FileService.writeToMigrationFile(pathToMigrationFile, final_string);
    
}
