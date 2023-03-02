import * as fs from 'fs';
import { sequelize } from '../main';
import { resolve } from 'path';

export function generateDownString(): string {
    return 'down: async (queryInterface, Sequelize) => { await queryInterface.sequelize.transaction(async (t) => {';
}

function generateFileName(migrationName: string) {
    return `${new Date()
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, -3)}-${migrationName}`;
}
export function writeToMigrationFile(path: string, content: string) {
    try {
        fs.appendFileSync(path, content);
    } catch (error) {
        console.log(error);
    }
}

export function generateMigrationFile(migrationName: string): string {
    let content: string = 'module.exports = {\n up: async (queryInterface, Sequelize) => {\nawait queryInterface.sequelize.transaction(async (t) => {';
    let path: string = resolve(__dirname, `../../migrations/${generateFileName(migrationName)}.js`);
    console.log('PATH:' + path);
    try {
        fs.writeFileSync(path, content);
    } catch (error) {
        console.log('FILE NOT CREATED')
        console.log(error);
    }
    return path;
}
