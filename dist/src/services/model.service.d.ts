import { Sequelize } from 'sequelize-typescript';
import { ModelAttributeColumnOptions } from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';
import { MigrationOptions } from '../common/interfaces';
export declare class ModelService {
    sequelize: Sequelize;
    migration_options: MigrationOptions | undefined;
    constructor(_sequelize: Sequelize);
    getModelByTableName(sequelize: Sequelize, table_name: string, table_schema: string): ModelCtor<Model<any, any>>;
    getTypeByModelAttr(current_type: any, res_string?: string, options?: {
        enum_values: string[];
        raw_type: string;
    }): string;
    generateModelsInfo(sequelize: Sequelize): {
        table_name: string;
        table_schema: string;
    }[];
    getModelColumnsAsString(description: {
        readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
    } | undefined): string;
    getModelColumnDescriptionAsString(description: {
        readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
    }, attr: string): string;
    getModelAttributesNames(description: {
        readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
    } | undefined): Array<string>;
    getColumnNameByField(description: {
        readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
    } | undefined, field: string): string;
    getModelReference(model_references: {
        model: {
            tableName: string;
            schema: string;
        } | string;
        key: string;
    }): {
        model: {
            tableName: string;
            schema: string;
        };
        key: string;
    };
    getModelUnique(unique_property: string | {
        name: string;
        msg: string;
    } | boolean): void;
}
