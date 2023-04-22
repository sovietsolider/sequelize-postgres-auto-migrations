import { Sequelize, Model, ModelCtor } from 'sequelize-typescript';
import { ModelAttributeColumnOptions } from 'sequelize';
import { TableToModel } from '../common/interfaces';
import { ModelService } from './model.service';
import { DbService } from './db.service';
export declare class StringsGeneratorService {
    private sequelize;
    private dbService;
    private modelService;
    private attrs_to_except;
    constructor(_sequelize: Sequelize, dbService: DbService, modelService: ModelService);
    getStringsToChangeTable(sequelize: Sequelize, table_schema: string, table_name: string, removed_fk: {
        [x: string]: boolean;
    }): Promise<{
        upString: {
            change_column_string: string;
            add_column_string: string;
            remove_column_string: string;
            add_constraints_string: {
                fk: string;
                pk: string;
                unique: string;
            };
            remove_constraints_string: {
                fk: string;
                pk: string;
                unique: string;
            };
        };
        downString: {
            change_column_string: string;
            add_column_string: string;
            remove_column_string: string;
            add_constraints_string: {
                fk: string;
                pk: string;
                unique: string;
            };
            remove_constraints_string: {
                fk: string;
                pk: string;
                unique: string;
            };
        };
    }>;
    getRawEnumType(tableInModel: {
        readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
    }, table_name: string, column_name: string): string;
    getChangedColumns(sequelize: Sequelize, table_schema: string, table_name: string): Promise<string[]>;
    getStringToChangeConstraints(table_schema: string, table_name: string, tableInModel: {
        readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
    }, tableInDb: TableToModel, removed_fk: {
        [x: string]: boolean;
    }): Promise<{
        res_up_string: {
            add_constr_string: {
                pk: string;
                fk: string;
                unique: string;
            };
            remove_constr_string: {
                pk: string;
                fk: string;
                unique: string;
            };
        };
        res_down_string: {
            add_constr_string: {
                pk: string;
                fk: string;
                unique: string;
            };
            remove_constr_string: {
                pk: string;
                fk: string;
                unique: string;
            };
        };
    }>;
    getStringToCompareUniqueConstraints(table_name: string, table_schema: string, tableInModel: {
        readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
    }, res_up_string: {
        add_constr_string: {
            pk: string;
            fk: string;
            unique: string;
        };
        remove_constr_string: {
            pk: string;
            fk: string;
            unique: string;
        };
    }, res_down_string: {
        add_constr_string: {
            pk: string;
            fk: string;
            unique: string;
        };
        remove_constr_string: {
            pk: string;
            fk: string;
            unique: string;
        };
    }, tableInDb?: TableToModel): void;
    getStringToDropFkBeforeChanging(table_name: string, table_schema: string, changed_columns: string[], removed_fk: {
        [x: string]: boolean;
    }): Promise<{
        res_up_string: {
            add_constr_string: string;
            remove_constr_string: string;
        };
        res_down_string: {
            add_constr_string: string;
            remove_constr_string: string;
        };
    }>;
    isReferenced(table_name: string, table_schema: string, column_name: string, models: {
        [key: string]: ModelCtor<Model<any, any>>;
    }): false | {
        columnName: string;
        column: ModelAttributeColumnOptions<import("sequelize").Model<any, any>>;
        tableName: any;
        schema: any;
    };
    getStringOfIndexes(table_schema: string, table_name: string, sequelize: Sequelize): Promise<{
        up_string: {
            add_index_string: string;
            remove_index_string: string;
        };
        down_string: {
            add_index_string: string;
            remove_index_string: string;
        };
    }>;
    private getQueryCreateIndexString;
    private getConstraintNameOfCompositeKey;
    private getConstraintName;
    getUpStringToAddTable(model: ModelCtor<Model<any, any>> | undefined, model_schema: string | undefined, table_name: string, table_schema: string): string;
    getDownStringToAddTable(sequelize: Sequelize, table_schema: string, table_name: string): Promise<string>;
    getUpStringToDeleteTable(model_schema: string | undefined, table_name: string, is_cascade: boolean): string;
}
