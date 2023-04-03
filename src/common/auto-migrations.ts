import { Sequelize } from 'sequelize-typescript';
import { FileService } from '../services/file.service';
import { compareTables } from './cmpFunctions';
import { MigrationOptions } from './interfaces';
import { DbService } from '../services/db.service';
import { StringsGeneratorService } from '../services/stringsGenerator.service';
import { ModelService } from '../services/model.service';
import { modelInfoType } from './interfaces';
import { Compare } from './compare';
import * as beautifier from 'js-beautify';

export class AutoMigrations {
    sequelize: Sequelize;

    constructor(sequelize: Sequelize) {
        this.sequelize = sequelize;
    }

    async generateMigration(name: string, path: string) {
        let fileService = new FileService();
        let path_ = fileService.generateMigrationFile(name, path);
        let modelService = new ModelService(this.sequelize);
        let dbService = new DbService(this.sequelize, modelService);
        let stringGeneratorService = new StringsGeneratorService(
            this.sequelize,
            dbService,
            modelService,
        );
        let compare = new Compare(this.sequelize, dbService, modelService, stringGeneratorService);

        const schema_info_tables = await this.sequelize.query(
            "SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema!='pg_catalog' AND table_schema!='information_schema'",
        );
        const schema_tables: Array<any> = schema_info_tables.at(0) as Array<any>;
        const tables: modelInfoType[] = modelService.generateModelsInfo(
            this.sequelize,
        ) as unknown as modelInfoType[];

        let add_strings: { upString: string; downString: string } = await compare.compareTables(
            this.sequelize,
            schema_tables,
            tables,
        ); //adding tables
        //let delete_string: { upString: string; downString: string } =
        //    await compare.deleteMissingTablesFromDbString(this.sequelize, schema_tables, tables); //deleting tables

        let final_string =
            'module.exports = { up: async (queryInterface, Sequelize) => {await queryInterface.sequelize.transaction(async (t) => {';
        final_string += add_strings.upString;
        //final_string += delete_string.upString;
        final_string +=
            '});},down: async (queryInterface, Sequelize) => {await queryInterface.sequelize.transaction(async (t) => {';
        final_string += add_strings.downString;
        //final_string += delete_string.downString;
        final_string += '});},};';
        final_string = beautifier.js_beautify(final_string);
        fileService.writeToMigrationFile(path_, final_string);
    }
}
