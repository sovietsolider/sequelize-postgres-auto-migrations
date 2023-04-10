import { Sequelize } from 'sequelize-typescript';
export declare class AutoMigrations {
    private sequelize;
    constructor(sequelize: Sequelize);
    generateMigration(name: string, path: string): Promise<void>;
}
