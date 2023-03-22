import { Sequelize } from 'sequelize-typescript';
import { FileService } from '../services/file.service';
import { compareTables } from './cmpFunctions';
export class AutoMigrations {
    seq: Sequelize;
    migration_options: { dropTableOnDelete: string|undefined } | undefined;
    constructor(sequelize: Sequelize, migration_options_: { dropTableOnDelete: string|undefined } | undefined = undefined) {
        this.seq = sequelize;
        this.migration_options = migration_options_;
    }

    async generateMigration(name: string, path: string) {
        let path_ = FileService.generateMigrationFile(name, path);
        await compareTables(this.seq, path_);
    }
}
