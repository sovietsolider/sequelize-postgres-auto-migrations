import { Sequelize, Model, ModelCtor } from 'sequelize-typescript';
import { ModelAttributeColumnOptions } from 'sequelize'; 
import { SchemaColumns, SchemaColumnType, sqlToSeqTypes, TableToModel, ModelAttribute } from '../common/interfaces';
import { ModelService } from './model.service';
import { DbService } from './db.service';
export class StringsGeneratorService {
    static async getStringsToChangeTable(sequelize: Sequelize, table_schema: string, table_name: string): Promise<{ upString: string, downString: string }> {
        let up_string = '';
        let down_string = '';
        let tableInDb: TableToModel = await DbService.tableToModelInfo(sequelize, table_schema, table_name);
        let tableInModel = (ModelService.getModelByTableName(sequelize, table_name, table_schema) as ModelCtor<Model<any, any>> | undefined)?.getAttributes();
        for(const column in tableInModel) {
            if (Object.keys(tableInDb).includes(column)) {
                let columns_different = false;
                let change_column_up_string = `await queryInterface.changeColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${column}', {`;
                let change_column_down_string = `await queryInterface.changeColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${column}', {`;
                if(ModelService.getTypeByModelAttr(tableInModel[column].type)!== tableInDb[column].type) {
                    change_column_up_string += `type: ${ModelService.getTypeByModelAttr(tableInModel[column].type)},`
                    change_column_down_string += `type: ${tableInDb[column].type},`
                    columns_different = true;
                }

                console.log("DB allow null: "+tableInDb[column].allowNull);
                console.log("Model allow null: "+tableInModel[column].allowNull);
                console.log(tableInModel[column])
                console.log(tableInDb[column]) 
                if(tableInModel[column].allowNull !== tableInDb[column].allowNull) { //if ableInModel[column].allowNull
                    change_column_up_string += `allowNull: ${tableInModel[column].allowNull},`
                    change_column_down_string += `allowNull: ${tableInDb[column].allowNull},`
                    columns_different = true;
                }
                if(tableInModel[column].autoIncrement !== tableInDb[column].autoIncrement) {
                    change_column_up_string += `autoIncrement: ${tableInModel[column].autoIncrement},`
                    change_column_down_string += `autoIncrement: ${tableInDb[column].autoIncrement},`
                    columns_different = true;
                }
                if(tableInModel[column].defaultValue !== tableInDb[column].defaultValue) {
                    if(typeof tableInModel[column].defaultValue === typeof '') {
                        change_column_up_string += `defaultValue: '${tableInModel[column].defaultValue}',`
                    }
                    else
                        change_column_up_string += `defaultValue: ${tableInModel[column].defaultValue},`
                    if(tableInDb[column].defaultValue && (typeof tableInDb[column].defaultValue === typeof ''))
                        change_column_down_string += `defaultValue: '${tableInDb[column].defaultValue}',`   
                    else if(tableInDb[column].defaultValue)
                        change_column_down_string += `defaultValue: ${tableInDb[column].defaultValue},`   
                    else
                        change_column_down_string += `defaultValue: undefined,`   
                    columns_different = true;
                }
                if(tableInModel[column].primaryKey !== tableInDb[column].primaryKey) {
                    change_column_up_string += `primaryKey: ${tableInModel[column].primaryKey},`
                    change_column_down_string += `primaryKey: ${tableInDb[column].primaryKey},`
                    columns_different = true;
                }
                let references_in_model = tableInModel[column].references as { model: { tableName: string, schema: string}| string, key: string};
                let reference_in_db = tableInDb[column].reference as { model: { tableName: string, schema: string}, key: string}
                console.log("CMP COLUMNS:")
                console.log(tableInDb[column])
                console.log(tableInModel[column])
                if(references_in_model) {
                    if(reference_in_db && (typeof(references_in_model.model) === typeof({})) 
                    && ((references_in_model.model as { tableName: string, schema: string}).tableName != reference_in_db.model.tableName 
                    || (references_in_model.model as { tableName: string, schema: string}).schema != reference_in_db.model.schema)) {
                        change_column_up_string += `reference: { model: { tableName: ${(references_in_model.model as { tableName: string, schema: string}).tableName}, schema: ${(references_in_model.model as { tableName: string, schema: string}).schema}}, key: '${references_in_model.key}'}, onUpdate: '${tableInModel[column].onUpdate}', onDelete: '${tableInModel[column].onDelete}',`
                        change_column_down_string += `reference: { model: { tableName: ${reference_in_db.model.tableName}, schema: ${reference_in_db.model.schema}}, key: '${reference_in_db.key}'}, onUpdate: '${tableInDb[column].onUpdate}', onDelete: '${tableInDb[column].onDelete}',`;
                        columns_different = true;
                    }
                    else if(reference_in_db && typeof(references_in_model.model) === typeof('') 
                    && (references_in_model.model != reference_in_db.model.tableName) && (reference_in_db.model.schema === 'public')) {
                        change_column_up_string += `reference: { model: { tableName: '${references_in_model.model}', schema: 'public'}, key: '${references_in_model.key}'}, onUpdate: '${tableInModel[column].onUpdate}', onDelete: '${tableInModel[column].onDelete}',`
                        change_column_down_string += `reference: { model: { tableName: '${reference_in_db.model.tableName}', schema: '${reference_in_db.model.schema}'}, key: '${reference_in_db.key}'}, onUpdate: '${tableInDb[column].onUpdate}', onDelete: '${tableInDb[column].onDelete}',`;
                        columns_different = true;
                    }   
                    else if(reference_in_db === undefined) {
                        change_column_up_string += `reference: { model: { tableName: ${(references_in_model.model as { tableName: string, schema: string}).tableName}, schema: ${(references_in_model.model as { tableName: string, schema: string}).schema}}, key: '${references_in_model.key}'}, onUpdate: '${tableInModel[column].onUpdate}', onDelete: '${tableInModel[column].onDelete}',`
                        change_column_down_string += `reference: undefined,`
                        columns_different = true;
                    }

                }
                else if(reference_in_db !== undefined){ //also undefined
                    change_column_up_string += `reference: undefined,`
                    change_column_down_string += `reference: { model: { tableName: '${reference_in_db.model.tableName}', schema: '${reference_in_db.model.schema}'}, key: '${reference_in_db.key}'}, onUpdate: '${tableInDb[column].onUpdate}', onDelete: '${tableInDb[column].onDelete}',`;
                    columns_different = true;

                }
                change_column_up_string += '},);' 
                change_column_down_string += '},);' 
                if(columns_different) {
                    up_string += change_column_up_string;   
                    down_string += change_column_down_string;
                }   
            }
        }
        return Promise.resolve({ upString: up_string, downString: down_string });
    }


    static getUpStringToAddTable(model: ModelCtor<Model<any, any>> | undefined, model_schema: string | undefined, table_name: string): string {
        //console.log('GENERATE STRING SCHEMA NAME');
        let description = model?.getAttributes();
        const attrs_to_except = ['type', 'Model', 'fieldName', '_modelAttribute', 'field', '_autoGenerated', 'values'];
        let res_string = `await queryInterface.createTable("${table_name}",{`;
        for (const attr in description) {
            //console.log(attr);
            res_string += `${attr}: {`;
            for (const inside_attr in description[attr]) {
                if (inside_attr === 'type') {
                    res_string += `${inside_attr}: ${ModelService.getTypeByModelAttr(description[attr].type)},`;
                }
                if (inside_attr === 'references') {
                    let reference = description[attr][inside_attr] as {
                        model: string;
                        key: string;
                    };
                    res_string += `${inside_attr}: { model: "${reference.model}", key: "${reference.key}"},`;
                    continue;
                } else if (inside_attr === 'onDelete' || inside_attr === 'onUpdate') {
                    res_string += `${inside_attr}: "${description[attr][inside_attr]}",`;
                    continue;
                }
                if (!attrs_to_except.includes(inside_attr)) {
                    res_string += `${inside_attr}: ${description[attr][inside_attr as keyof object]},`;
                }
            }
            res_string += '},';
        }
        res_string += `},{ transaction: t, schema: "${model_schema}"},);`;
        return res_string;
    }
    
    static async getDownStringToAddTable(sequelize: Sequelize, table_schema: string, table_name: string): Promise<string> {
        //console.log("GENERATED INFO")
        let res_string = `await queryInterface.createTable("${table_name}",{`;
        let attributes = await DbService.tableToModelInfo(sequelize, table_schema, table_name);
        for(const column in attributes) {
            let options: ModelAttribute = attributes[column];
            res_string += `${column}: `
            //console.log('COLUMN!')
            //console.log(attributes[column])
            res_string += `${JSON.stringify(options)}, `;
            //console.log(res_string.match(/"\btype":"DataType.\b[^"]*"/g))
            res_string = res_string.replace(/"\btype":"DataType.\b[^"]*"/g, `"type":${options.type}`);
        }
        res_string += `},{ transaction: t, schema: "${table_schema}"},);`;
        
        return Promise.resolve(res_string);
    }
    
    static getUpStringToDeleteTable(model_schema: string | undefined, table_name: string) {
        return `await queryInterface.dropTable({ tableName: '${table_name}', tableSchema: '${model_schema}'},{ transaction: t },);`;
    }
}