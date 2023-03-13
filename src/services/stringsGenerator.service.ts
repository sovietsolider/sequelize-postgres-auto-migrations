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
                /*
                if (tableInModel[column].primaryKey !== tableInDb[real_column_name].primaryKey) {
                    change_column_up_string += `primaryKey: ${tableInModel[column].primaryKey},`;
                    change_column_down_string += `primaryKey: ${tableInDb[real_column_name].primaryKey},`;
                    columns_different = true;
                }*/
                let constraints_up_string = '';
                if (tableInModel[column].unique !== tableInDb[real_column_name].unique) { //UNIQUE
                    if(tableInModel[column].unique === undefined || tableInModel[column].unique === false) { //добавить .name к unique
                        constraints_up_string +=  `await queryInterface.removeConstraint({tableName: '${table_name}', schema: '${table_schema}'}, '${tableInDb[real_column_name].unique_name}');`;
                    }
                    else 
                        constraints_up_string += `await queryInterface.addConstraint({tableName: '${table_name}, schema: '${table_schema}'}, { type: 'UNIQUE'});`;
                    columns_different = true;
                }
                if (tableInModel[column].primaryKey !== tableInDb[real_column_name].primaryKey) { //PRIMTARY KEY
                    if(tableInModel[column].primaryKey === undefined || tableInModel[column].primaryKey === false) { 
                        constraints_up_string +=  `await queryInterface.removeConstraint({tableName: '${table_name}', schema: '${table_schema}'}, '${tableInDb[real_column_name].pk_name}');`;
                    }
                    else 
                        constraints_up_string += `await queryInterface.addConstraint({tableName: '${table_name}, schema: '${table_schema}'}, { type: 'PRIMARY KEY'});`;
                    columns_different = true;
                }
                if (tableInModel[column].references === undefined && tableInDb[real_column_name].foreignKey === true) { //FOREIGN KEY
                    constraints_up_string +=  `await queryInterface.removeConstraint({tableName: '${table_name}', schema: '${table_schema}'}, '${tableInDb[real_column_name].fk_name}');`;
                }
                else if(tableInModel[column].references !== undefined && tableInDb[real_column_name].foreignKey === undefined) {
                    let model_references = this.getModelReference(tableInModel[column].references as { model: string | { tableName: string; schema: string; }; key: string; });
                    let table_references = tableInDb[real_column_name].reference;
                    constraints_up_string +=  `await queryInterface.addConstraint({tableName: '${table_name}', schema: '${table_schema}'}, { type: 'FOREIGN KEY', references: { table: { tableName: '${model_references.model.tableName}', schema: '${
                        model_references.model.schema}'}, field: '${model_references.key}'}, onUpdate: '${tableInModel[column].onUpdate}', onDelete: '${tableInModel[column].onDelete},'});`;
                }
                else if(tableInModel[column].references !== undefined && tableInDb[real_column_name].foreignKey === true) {
                    //// add here
                    let model_references = this.getModelReference(tableInModel[column].references as { model: string | { tableName: string; schema: string; }; key: string; });
                    let table_references = tableInDb[real_column_name].reference;
                    console.log("REFERENCES ARE DIFFERENT")
                    console.log(model_references);
                    console.log(table_references);
                    if(JSON.stringify(model_references) !== JSON.stringify(table_references)) {
                        constraints_up_string +=  `await queryInterface.removeConstraint({tableName: '${table_name}', schema: '${table_schema}'}, '${tableInDb[real_column_name].fk_name}');`;
                        constraints_up_string +=  `await queryInterface.addConstraint({tableName: '${table_name}', schema: '${table_schema}'}, { type: 'FOREIGN KEY', references: { table: { tableName: '${model_references.model.tableName}'}, schema: '${
                            model_references.model.schema}'}, field: '${model_references.key}'}, onUpdate: '${tableInModel[column].onUpdate}', onDelete: '${tableInModel[column].onDelete},'});`;                    
                    }
                    
                }
                if(constraints_up_string !== '')
                    up_string += constraints_up_string;
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

    static getModelReference(model_references: {model: {tableName: string; schema: string;} | string; key: string;}){
        let res: any = {};
        if(typeof model_references.model === typeof {}) {
            res.model = model_references.model as {tableName: string; schema: string;};
            res.key = model_references.key;
        }
        else if (typeof model_references.model === typeof '') {
            res.model = { tableName: model_references.model as string, schema: 'public'};
            res.key = model_references.key
        }
        return res as { model: { tableName:string, schema:string}, key: string};
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
