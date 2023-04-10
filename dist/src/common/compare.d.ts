import { Sequelize } from 'sequelize-typescript';
import { DbService } from '../services/db.service';
import { modelInfoType } from './interfaces';
import { ModelService } from '../services/model.service';
import { StringsGeneratorService } from '../services/stringsGenerator.service';
export declare class Compare {
    dbService: DbService;
    modelService: ModelService;
    sequelize: Sequelize;
    removed_fk: {
        [x: string]: boolean;
    };
    stringGeneratorService: StringsGeneratorService;
    constructor(_sequelize: Sequelize, _dbService: DbService, _modelService: ModelService, _stringGeneratorService: StringsGeneratorService);
    compareTables(sequelize: Sequelize, schema_tables: Array<any>, tables: modelInfoType[]): Promise<{
        upString: string;
        downString: string;
    }>;
    private deleteMissingTablesFromDbString;
}
