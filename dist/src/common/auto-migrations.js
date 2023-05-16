"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoMigrations = void 0;
const file_service_1 = require("../services/file.service");
const db_service_1 = require("../services/db.service");
const stringsGenerator_service_1 = require("../services/stringsGenerator.service");
const model_service_1 = require("../services/model.service");
const compare_1 = require("./compare");
const beautifier = require("js-beautify");
class AutoMigrations {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }
    async generateMigration(name, path) {
        let modelService = new model_service_1.ModelService(this.sequelize);
        let dbService = new db_service_1.DbService(this.sequelize, modelService);
        let stringGeneratorService = new stringsGenerator_service_1.StringsGeneratorService(this.sequelize, dbService, modelService);
        let compare = new compare_1.Compare(this.sequelize, dbService, modelService, stringGeneratorService);
        const schema_info_tables = await this.sequelize.query("SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema!='pg_catalog' AND table_schema!='information_schema'");
        const schema_tables = schema_info_tables.at(0);
        const tables = modelService.generateModelsInfo(this.sequelize);
        let add_strings = await compare.compareTables(this.sequelize, schema_tables, tables);
        let final_string = 'module.exports = { up: async (queryInterface, Sequelize) => {await queryInterface.sequelize.transaction(async (t) => {';
        final_string += add_strings.upString;
        final_string +=
            '});},down: async (queryInterface, Sequelize) => {await queryInterface.sequelize.transaction(async (t) => {';
        final_string += add_strings.downString;
        final_string += '});},};';
        final_string = beautifier.js_beautify(final_string);
        //console.log(final_string)
        let fileService = new file_service_1.FileService(this.sequelize);
        if ((add_strings.upString !== '' || add_strings.downString !== '') && await fileService.checkMigrationHasRun(path)) {
            let path_ = await fileService.generateMigrationFile(name, path);
            fileService.writeToMigrationFile(path_, final_string);
        }
    }
}
exports.AutoMigrations = AutoMigrations;
//# sourceMappingURL=auto-migrations.js.map