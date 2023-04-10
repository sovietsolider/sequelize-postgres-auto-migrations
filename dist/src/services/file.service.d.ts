import { Sequelize } from 'sequelize-typescript';
export declare class FileService {
    private sequelize;
    constructor(_sequelize: Sequelize);
    generateDownString(): string;
    generateFileName(migrationName: string): string;
    writeToMigrationFile(path: string, content: string): void;
    generateMigrationFile(migrationName: string, path: string): Promise<string>;
    checkMigrationHasRun(migration_path: string): Promise<boolean>;
}
