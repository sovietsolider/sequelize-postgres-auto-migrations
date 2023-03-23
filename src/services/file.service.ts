import * as fs from 'fs';
import { resolve } from 'path';

export class FileService {
    static generateDownString(): string {
        return 'down: async (queryInterface, Sequelize) => { await queryInterface.sequelize.transaction(async (t) => {';
    }

    static generateFileName(migrationName: string) {
        return `${new Date()
            .toISOString()
            .replace(/[^0-9]/g, '')
            .slice(0, -3)}-${migrationName}`;
    }
    static writeToMigrationFile(path: string, content: string) {
        //console.log(content)
        try {
            fs.appendFileSync(path, content);
        } catch (error) {
            console.log(error);
        }
    }

    static generateMigrationFile(migrationName: string, path: string): string {
        //let content: string = 'module.exports = { up: async (queryInterface, Sequelize) => {await queryInterface.sequelize.transaction(async (t) => {';
        let res_path: string = `${path}/${this.generateFileName(migrationName)}.js`;
        console.log('PATH:' + path);
        try {
            fs.writeFileSync(res_path, '');
        } catch (error) {
            console.log('FILE NOT CREATED');
            console.log(error);
        }
        return res_path;
    }
}
