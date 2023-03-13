import { Sequelize, Model, ModelCtor } from 'sequelize-typescript';
import { ModelAttributeColumnOptions } from 'sequelize';
import { SchemaColumns, SchemaColumnType, sqlToSeqTypes, TableToModel, ModelAttribute } from '../common/interfaces';
import { ModelService } from './model.service';
import { DbService } from './db.service';
export class StringsGeneratorService {
    static async getStringsToChangeTable(sequelize: Sequelize, table_schema: string, table_name: string): Promise<{ upString: string; downString: string }> {
        let up_string = '';
        let down_string = '';
        let tableInDb: TableToModel = await DbService.tableToModelInfo(sequelize, table_schema, table_name);
        let tableInModel = (ModelService.getModelByTableName(sequelize, table_name, table_schema) as ModelCtor<Model<any, any>>).getAttributes();
        const model_columns_names = ModelService.getModelAttributesNames(tableInModel);
        for (const column in tableInModel) {
            let real_column_name = tableInModel[column].field as string;
            if (Object.keys(tableInDb).includes(real_column_name)) {
                let columns_different = false;
                let change_column_up_string = `await queryInterface.changeColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${real_column_name}', {`;
                let change_column_down_string = `await queryInterface.changeColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${real_column_name}', {`;
                change_column_up_string += `type: ${ModelService.getTypeByModelAttr(tableInModel[column].type)},`;
                change_column_down_string += `type: ${tableInDb[real_column_name].type},`;
                if (ModelService.getTypeByModelAttr(tableInModel[column].type) !== tableInDb[real_column_name].type) { 
                    columns_different = true;
                };
                let model_allow_null = tableInModel[column].allowNull;
                if(tableInModel[column].primaryKey || tableInModel[column].autoIncrement) {
                    model_allow_null = false;
                }
                if(model_allow_null === undefined)
                    model_allow_null = true;
                if (model_allow_null !== tableInDb[real_column_name].allowNull) {
                    change_column_up_string += `allowNull: ${model_allow_null},`;
                    change_column_down_string += `allowNull: ${tableInDb[real_column_name].allowNull},`;
                    columns_different = true;
                }
                if (tableInModel[column].autoIncrement !== tableInDb[real_column_name].autoIncrement) {
                    change_column_up_string += `autoIncrement: ${tableInModel[column].autoIncrement},`;
                    change_column_down_string += `autoIncrement: ${tableInDb[real_column_name].autoIncrement},`;
                    columns_different = true;
                }
                if (tableInModel[column].defaultValue !== tableInDb[real_column_name].defaultValue) {
                    change_column_up_string += `defaultValue: ${JSON.stringify(tableInModel[column].defaultValue)},`;
                    change_column_down_string += `defaultValue: ${tableInDb[real_column_name].defaultValue},`;

                    columns_different = true;
                }
                if (tableInModel[column].primaryKey !== tableInDb[real_column_name].primaryKey) {
                    change_column_up_string += `primaryKey: ${tableInModel[column].primaryKey},`;
                    change_column_down_string += `primaryKey: ${tableInDb[real_column_name].primaryKey},`;
                    columns_different = true;
                }
                if (tableInModel[column].unique !== tableInDb[real_column_name].unique) {
                    change_column_up_string += `unique: ${tableInModel[column].unique},`;
                    change_column_down_string += `unique: ${tableInDb[real_column_name].unique},`;
                    columns_different = true;
                }
                let references_in_model = tableInModel[column].references as { model: { tableName: string; schema: string } | string; key: string };
                let reference_in_db = tableInDb[real_column_name].reference as { model: { tableName: string; schema: string }; key: string };
                if (references_in_model) {
                    if (
                        reference_in_db &&
                        typeof references_in_model.model === typeof {} &&
                        ((references_in_model.model as { tableName: string; schema: string }).tableName != reference_in_db.model.tableName || (references_in_model.model as { tableName: string; schema: string }).schema != reference_in_db.model.schema)
                    ) {
                        change_column_up_string += `references: { model: { tableName: ${(references_in_model.model as { tableName: string; schema: string }).tableName}, schema: ${
                            (references_in_model.model as { tableName: string; schema: string }).schema
                        }}, key: '${references_in_model.key}'}, onUpdate: '${tableInModel[column].onUpdate}', onDelete: '${tableInModel[column].onDelete}',`;
                        change_column_down_string += `references: { model: { tableName: ${reference_in_db.model.tableName}, schema: ${reference_in_db.model.schema}}, key: '${reference_in_db.key}'}, onUpdate: '${tableInDb[column].onUpdate}', onDelete: '${tableInDb[column].onDelete}',`;
                        columns_different = true;
                    } else if (reference_in_db && typeof references_in_model.model === typeof '' && references_in_model.model != reference_in_db.model.tableName && reference_in_db.model.schema === 'public') {
                        change_column_up_string += `references: { model: { tableName: '${references_in_model.model}', schema: 'public'}, key: '${references_in_model.key}'}, onUpdate: '${tableInModel[column].onUpdate}', onDelete: '${tableInModel[column].onDelete}',`;
                        change_column_down_string += `references: { model: { tableName: '${reference_in_db.model.tableName}', schema: '${reference_in_db.model.schema}'}, key: '${reference_in_db.key}'}, onUpdate: '${tableInDb[column].onUpdate}', onDelete: '${tableInDb[column].onDelete}',`;
                        columns_different = true;
                    } else if (reference_in_db === undefined) {
                        change_column_up_string += `references: { model: { tableName: ${(references_in_model.model as { tableName: string; schema: string }).tableName}, schema: ${
                            (references_in_model.model as { tableName: string; schema: string }).schema
                        }}, key: '${references_in_model.key}'}, onUpdate: '${tableInModel[column].onUpdate}', onDelete: '${tableInModel[column].onDelete}',`;
                        change_column_down_string += `references: undefined,`;
                        columns_different = true;
                    }
                } else if (reference_in_db !== undefined) {
                    //also undefined
                    change_column_up_string += `references: undefined,`;
                    change_column_down_string += `references: { model: { tableName: '${reference_in_db.model.tableName}', schema: '${reference_in_db.model.schema}'}, key: '${reference_in_db.key}'}, onUpdate: '${tableInDb[column].onUpdate}', onDelete: '${tableInDb[column].onDelete}',`;
                    columns_different = true;
                }
                change_column_up_string += '},{ transaction: t });';
                change_column_down_string += '},{ transaction: t});';
                if (columns_different) {
                    up_string += change_column_up_string;
                    down_string += change_column_down_string;
                }
            } else {
                //column is missing in Db -> add
                up_string += `await queryInterface.addColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${real_column_name}', {`;
                up_string += ModelService.getModelColumnDescriptionAsString(tableInModel, column);
                up_string += `{ transaction: t });`;
                down_string += `await queryInterface.removeColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${real_column_name}', {transaction: t});`;
            }
        }
        //column is missing in Model -> delete
        for (const column in tableInDb) {
            if (!model_columns_names.includes(column)) {
                up_string += `await queryInterface.removeColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${column}', {transaction: t});`;
                down_string += `await queryInterface.addColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${column}', {`;
                for (const column_attr in tableInDb[column]) {
                    down_string += `${column_attr}: ${tableInDb[column][column_attr as keyof object]},`;
                }
                down_string += '},{transaction: t});';
            }
        }
        return Promise.resolve({ upString: up_string, downString: down_string });
    }

    static getUpStringToAddTable(model: ModelCtor<Model<any, any>> | undefined, model_schema: string | undefined, table_name: string): string {
        //console.log('GENERATE STRING SCHEMA NAME');
        let description = model?.getAttributes();
        let res_string = `await queryInterface.createTable("${table_name}",{`;
        res_string += ModelService.getModelColumnsAsString(description);
        res_string += `},{ transaction: t, schema: "${model_schema}"},);`;
        return res_string;
    }

    static async getDownStringToAddTable(sequelize: Sequelize, table_schema: string, table_name: string): Promise<string> {
        //console.log("GENERATED INFO")
        let res_string = `await queryInterface.createTable("${table_name}",{`;
        let attributes = await DbService.tableToModelInfo(sequelize, table_schema, table_name);
        for (const column in attributes) {
            let options: ModelAttribute = attributes[column];
            res_string += `${column}: `;
            //console.log('COLUMN!')
            //console.log(attributes[column])
            res_string += `${JSON.stringify(options)}, `;
            //console.log(res_string.match(/"\btype":"DataType.\b[^"]*"/g))
            res_string = res_string.replace(/"\btype":"Sequelize.\b[^"]*"/g, `"type":${options.type}`);
        }
        res_string += `},{ transaction: t, schema: "${table_schema}"},);`;

        return Promise.resolve(res_string);
    }

    static getUpStringToDeleteTable(model_schema: string | undefined, table_name: string) {
        return `await queryInterface.dropTable({ tableName: '${table_name}', tableSchema: '${model_schema}'},{ transaction: t },);`;
    }
}
