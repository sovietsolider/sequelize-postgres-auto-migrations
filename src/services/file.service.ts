import * as fs from 'fs';
import { resolve } from 'path';
import { Sequelize } from 'sequelize-typescript';

export class FileService {
    private sequelize: Sequelize;
    constructor(_sequelize: Sequelize) {
        this.sequelize = _sequelize;
    }

    generateDownString(): string {
        return 'down: async (queryInterface, Sequelize) => { await queryInterface.sequelize.transaction(async (t) => {';
    }

    generateFileName(migrationName: string) {
        return `${new Date()
            .toISOString()
            .replace(/[^0-9]/g, '')
            .slice(0, -3)}-${migrationName}`;
    }
    writeToMigrationFile(path: string, content: string) {
        try {
            fs.appendFileSync(path, content);
        } catch (error) {
            console.log(error);
        }
    }

    async generateMigrationFile(migrationName: string, path: string): Promise<string> {
        let res_path: string = `${path}/${this.generateFileName(migrationName)}.js`;
        try {
            fs.writeFileSync(res_path, '');
        } catch (error) {
            console.log(error);
        }
        return Promise.resolve(res_path);
    }

    async checkMigrationHasRun(migration_path: string): Promise<boolean> {
        let migrations: string[] = fs.readdirSync(migration_path);
        
        let all_tables = (await this.sequelize.query('SELECT table_name as table_name FROM information_schema.tables')).at(0) as Array<any>;
        //console.log(all_tables.find(r => r.table_name === 'SequelizeMeta'))
        if(!all_tables.find(r => r.table_name === 'SequelizeMeta') && migrations.length === 0)
            return Promise.resolve(true);
        else if(!all_tables.find(r => r.table_name === 'SequelizeMeta') && migrations.length !== 0) {
            return Promise.resolve(false);
        }
            
        let migrations_in_db = ((await this.sequelize.query('SELECT * FROM "SequelizeMeta" ORDER BY name DESC')).at(0) as unknown as {name:string}[]).map(r => r.name);
        if(migrations.filter(r => !migrations_in_db.includes(r)).length !== 0) {
            let res_string = `Migrations weren't executed: [${migrations.filter(r => !migrations_in_db.includes(r)).join(', ')}]`
            console.log(res_string)
            return Promise.resolve(false)
        }
        else {
            console.log("All previous migrations are executed")
            return Promise.resolve(true);
        }
    }
}
