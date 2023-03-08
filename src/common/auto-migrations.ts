import { Sequelize } from 'sequelize-typescript';
import { FileService } from '../services/file.service';
import { compareTables } from './cmpFunctions';
export class AutoMigrations {
    seq: Sequelize;
    constructor(sequelize: Sequelize) {
        this.seq = sequelize;
    }

    async generateMigration(name: string, path: string) {
        let path_ = FileService.generateMigrationFile(name, path);
        await compareTables(this.seq, path_);
    }
}
