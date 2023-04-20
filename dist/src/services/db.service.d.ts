import { Sequelize } from 'sequelize-typescript';
import { MigrationOptions, TableToModel } from '../common/interfaces';
import { ModelService } from './model.service';
export declare class DbService {
    sequelize: Sequelize;
    migration_options: MigrationOptions | undefined;
    modelService: ModelService;
    constructor(_sequelize: Sequelize, modelService: ModelService);
    cmpTablesByRefInModel(sequelize: Sequelize, modelService: ModelService): (table1_name_str: string, table2_name_str: string) => 0 | 1 | -1;
    compareTablesByReferencesInDb(tables_for_cmp_func: {
        [x: string]: TableToModel;
    }, modelService: ModelService): (table1_name_str: string, table2_name_str: string) => 0 | 1 | -1;
    private getPgColumnsInfo;
    private getForeignKeyOptions;
    private generateTableInfo;
    getRawType(sequelize: Sequelize, table_schema: string, table_name: string, column_name: string): Promise<string>;
    tableToModelInfo(sequelize: Sequelize, table_schema: string, table_name: string, options?: {
        enum_values: string[];
        column_name: string;
    }): Promise<TableToModel>;
    private parseDefaultValue;
    getColumnsConstraintsSchemaInfo(table_schema: string, table_name: string): string;
    getTableIndexes(table_schema: string, table_name: string, sequelize: Sequelize): Promise<[unknown[], unknown]>;
    getTableColumnsComments(table_schema: string, table_name: string, sequelize: Sequelize): Promise<{
        column_name: string;
        col_description: string;
    }[]>;
    getTableExists(table_schema: string, table_name: string, sequelize: Sequelize): Promise<boolean>;
}
