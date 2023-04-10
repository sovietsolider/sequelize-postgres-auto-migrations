"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const fs = require("fs");
class FileService {
    sequelize;
    constructor(_sequelize) {
        this.sequelize = _sequelize;
    }
    generateDownString() {
        return 'down: async (queryInterface, Sequelize) => { await queryInterface.sequelize.transaction(async (t) => {';
    }
    generateFileName(migrationName) {
        return `${new Date()
            .toISOString()
            .replace(/[^0-9]/g, '')
            .slice(0, -3)}-${migrationName}`;
    }
    writeToMigrationFile(path, content) {
        //console.log(content)
        try {
            fs.appendFileSync(path, content);
        }
        catch (error) {
            console.log(error);
        }
    }
    async generateMigrationFile(migrationName, path) {
        //console.log(await this.checkMigrationHasRun(path));
        //let content: string = 'module.exports = { up: async (queryInterface, Sequelize) => {await queryInterface.sequelize.transaction(async (t) => {';
        let res_path = `${path}/${this.generateFileName(migrationName)}.js`;
        try {
            fs.writeFileSync(res_path, '');
        }
        catch (error) {
            console.log(error);
        }
        return Promise.resolve(res_path);
    }
    async checkMigrationHasRun(migration_path) {
        let migrations = fs.readdirSync(migration_path);
        console.log(migration_path);
        console.log(migrations);
        let all_tables = ((await this.sequelize.query('SELECT table_name FROM information_schema.tables')).at(0));
        if (!all_tables.find(r => r.table_name === 'SequelizeMeta') && migrations.length === 0)
            return Promise.resolve(true);
        else if (!all_tables.find(r => r.table_name === 'SequelizeMeta') && migrations.length !== 0) {
            console.log(false);
            return Promise.resolve(false);
        }
        let migrations_in_db = (await this.sequelize.query('SELECT * FROM "SequelizeMeta" ORDER BY name DESC')).at(0).map(r => r.name);
        if (migrations.filter(r => !migrations_in_db.includes(r)).length !== 0) {
            let res_string = `Migrations weren't executed: [${migrations.filter(r => !migrations_in_db.includes(r)).join(', ')}]`;
            console.log(res_string);
            return Promise.resolve(false);
        }
        else {
            console.log("All previous migrations are executed");
            return Promise.resolve(true);
        }
    }
}
exports.FileService = FileService;
//# sourceMappingURL=file.service.js.map