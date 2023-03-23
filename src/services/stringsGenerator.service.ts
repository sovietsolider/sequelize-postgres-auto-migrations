import { Sequelize, Model, ModelCtor } from 'sequelize-typescript';
import { ModelAttributeColumnOptions, WhereOptions } from 'sequelize';
import {
    SchemaColumns,
    SchemaColumnType,
    sqlToSeqTypes,
    TableToModel,
    ModelAttribute,
    MigrationOptions,
} from '../common/interfaces';
import { ModelService } from './model.service';
import { DbService } from './db.service';
import { IndexesOptions } from 'sequelize';

export class StringsGeneratorService {
    static async getStringsToChangeTable(
        sequelize: Sequelize,
        table_schema: string,
        table_name: string,
    ): Promise<{ upString: string; downString: string }> {
        let up_string: {
            change_column_string: string;
            add_column_string: string;
            remove_column_string: string;
        } = {
            change_column_string: '',
            add_column_string: '',
            remove_column_string: '',
        };
        let down_string: {
            change_column_string: string;
            add_column_string: string;
            remove_column_string: string;
        } = {
            change_column_string: '',
            add_column_string: '',
            remove_column_string: '',
        };

        let tableInDb: TableToModel = await DbService.tableToModelInfo(
            sequelize,
            table_schema,
            table_name,
        );
        let tableInModel = (
            ModelService.getModelByTableName(sequelize, table_name, table_schema) as ModelCtor<
                Model<any, any>
            >
        ).getAttributes();
        const model_columns_names = ModelService.getModelAttributesNames(tableInModel);
        for (const column in tableInModel) {
            let real_column_name = tableInModel[column].field as string;
            if (Object.keys(tableInDb).includes(real_column_name)) {
                let columns_different = false;
                up_string.change_column_string = `await queryInterface.changeColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${real_column_name}', {`;
                down_string.change_column_string = `await queryInterface.changeColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${real_column_name}', {`;
                up_string.change_column_string += `type: ${ModelService.getTypeByModelAttr(
                    tableInModel[column].type,
                )},`;
                down_string.change_column_string += `type: ${tableInDb[real_column_name].type},`;
                if (
                    ModelService.getTypeByModelAttr(tableInModel[column].type) !==
                    tableInDb[real_column_name].type
                ) {
                    columns_different = true;
                }
                let model_allow_null = tableInModel[column].allowNull;
                if (tableInModel[column].primaryKey || tableInModel[column].autoIncrement) {
                    model_allow_null = false;
                }
                if (model_allow_null === undefined) model_allow_null = true;
                if (model_allow_null !== tableInDb[real_column_name].allowNull) {
                    up_string.change_column_string += `allowNull: ${model_allow_null},`;
                    down_string.change_column_string += `allowNull: ${tableInDb[real_column_name].allowNull},`;
                    columns_different = true;
                }
                if (
                    tableInModel[column].autoIncrement !== tableInDb[real_column_name].autoIncrement
                ) {
                    up_string.change_column_string += `autoIncrement: ${tableInModel[column].autoIncrement},`;
                    down_string.change_column_string += `autoIncrement: ${tableInDb[real_column_name].autoIncrement},`;
                    columns_different = true;
                }
                if (
                    tableInModel[column].defaultValue !== tableInDb[real_column_name].defaultValue
                ) {
                    up_string.change_column_string += `defaultValue: ${JSON.stringify(
                        tableInModel[column].defaultValue,
                    )},`;
                    down_string.change_column_string += `defaultValue: ${tableInDb[real_column_name].defaultValue},`;

                    columns_different = true;
                }

                up_string.change_column_string += '},{ transaction: t });';
                down_string.change_column_string += '},{ transaction: t});';
                if (!columns_different) {
                    up_string.change_column_string = '';
                    down_string.change_column_string = '';
                }
            } else {
                //column is missing in Db -> add
                up_string.add_column_string += `await queryInterface.addColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${real_column_name}', {`;
                up_string.add_column_string += ModelService.getModelColumnDescriptionAsString(
                    tableInModel,
                    column,
                );
                up_string.add_column_string += `{ transaction: t });`;
                down_string.remove_column_string += `await queryInterface.removeColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${real_column_name}', {transaction: t});`;
            }
        }
        //column is missing in Model -> delete
        for (const column in tableInDb) {
            if (!model_columns_names.includes(column)) {
                up_string.remove_column_string += `await queryInterface.removeColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${column}', {transaction: t});`;
                down_string.add_column_string += `await queryInterface.addColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${column}', {`;
                for (const column_attr in tableInDb[column]) {
                    down_string.add_column_string += `${column_attr}: ${
                        tableInDb[column][column_attr as keyof object]
                    },`;
                }
                down_string.add_column_string += '},{transaction: t});';
            }
        }

        let res_string: { up_string: string; down_string: string } = {
            up_string: '',
            down_string: '',
        };
        res_string.up_string += this.comparePkConstraint(
            table_schema,
            table_name,
            tableInModel,
            tableInDb,
        ).res_up_string.remove_constr_string; //удаление ограничений
        res_string.up_string += up_string.remove_column_string; //удаление атрибутов
        res_string.up_string += up_string.add_column_string; //добавление атрибутов
        res_string.up_string += up_string.change_column_string; //изменение атрибутов
        res_string.up_string += this.comparePkConstraint(
            table_schema,
            table_name,
            tableInModel,
            tableInDb,
        ).res_up_string.add_constr_string; //добавление ограничений

        res_string.down_string += this.comparePkConstraint(
            table_schema,
            table_name,
            tableInModel,
            tableInDb,
        ).res_down_string.remove_constr_string; //удаление ограничений
        res_string.down_string += down_string.remove_column_string; //удаление атрибутов
        res_string.down_string += down_string.add_column_string; //добавление атрибутов
        res_string.down_string += down_string.change_column_string; //изменение атрибутов
        res_string.down_string += this.comparePkConstraint(
            table_schema,
            table_name,
            tableInModel,
            tableInDb,
        ).res_down_string.add_constr_string; //добавление ограничений
        //this.getStringOfIndexes(table_schema, table_name, tableInModel, tableInDb, sequelize);

        return Promise.resolve({
            upString: res_string.up_string,
            downString: res_string.down_string,
        });
    }

    private static comparePkConstraint(
        table_schema: string,
        table_name: string,
        tableInModel: {
            readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
        },
        tableInDb: TableToModel,
    ) {
        let res_up_string: {
            add_constr_string: string;
            remove_constr_string: string;
        } = {
            add_constr_string: '',
            remove_constr_string: '',
        };
        let res_down_string: {
            add_constr_string: string;
            remove_constr_string: string;
        } = {
            add_constr_string: '',
            remove_constr_string: '',
        };
        let pk_model_fields: Array<string> = [];
        let pk_db_fields: Array<string> = [];
        let fk_model_fields: Array<string> = [];
        let fk_db_fields: Array<string> = [];
        let unique_model_fields: Array<string> = [];
        let unique_db_fields: Array<string> = [];
        console.log(tableInDb)
        for (const column in tableInModel) {
            let real_column_name = tableInModel[column].field as string;
            if (tableInModel[column].primaryKey) pk_model_fields.push(real_column_name);
            else if (tableInModel[column].references) fk_model_fields.push(real_column_name);
            else if (tableInModel[column].unique) unique_model_fields.push(real_column_name);
        }
        for (const column in tableInDb) {
            if (tableInDb[column].primaryKey) pk_db_fields.push(column);
            else if (tableInDb[column].foreignKey) fk_db_fields.push(column);
            else if (tableInDb[column].unique) unique_db_fields.push(column);
        }
        //PRIMARY KEYS
        if (pk_model_fields.length !== 0 && pk_db_fields.length === 0) {
            res_up_string.add_constr_string += `await queryInterface.addConstraint({tableName: '${table_name}', schema: '${table_schema}'}, { type: 'PRIMARY KEY', fields: ['${pk_model_fields.join(
                "','",
            )}'], transaction: t});`;
            res_down_string.remove_constr_string += `await queryInterface.removeConstraint({tableName: '${table_name}', schema: '${table_schema}'}, '${this.getConstraintNameByModel(
                table_name,
                table_schema,
                '',
                'pkey',
            )}', {transaction: t});`;
        } else if (pk_model_fields.length === 0 && pk_db_fields.length !== 0) {
            res_up_string.remove_constr_string += `await queryInterface.removeConstraint({tableName: '${table_name}', schema: '${table_schema}'}, '${
                tableInDb[pk_db_fields[0]].pk_name
            }', {transaction: t});`;
            res_down_string.add_constr_string += `await queryInterface.addConstraint({tableName: '${table_name}', schema: '${table_schema}'}, { type: 'PRIMARY KEY', fields:['${pk_db_fields.join(
                "','",
            )}'], transaction: t});`;
        } else if (
            JSON.stringify(pk_model_fields) !== JSON.stringify(pk_db_fields) &&
            pk_model_fields[0]
        ) {
            res_up_string.remove_constr_string += `await queryInterface.removeConstraint({tableName: '${table_name}', schema: '${table_schema}'}, '${
                tableInDb[pk_db_fields[0]].pk_name
            }', {transaction: t});`;
            res_up_string.add_constr_string += `await queryInterface.addConstraint({tableName: '${table_name}', schema: '${table_schema}'}, { type: 'PRIMARY KEY', fields: ['${pk_model_fields.join(
                "','",
            )}'], transaction: t});`;
            res_down_string.remove_constr_string += `await queryInterface.removeConstraint({tableName: '${table_name}', schema: '${table_schema}'}, '${this.getConstraintNameByModel(
                table_name,
                table_schema,
                '',
                'pkey',
            )}', {transaction: t});`;
            res_down_string.add_constr_string += `await queryInterface.addConstraint({tableName: '${table_name}', schema: '${table_schema}'}, { type: 'PRIMARY KEY', fields:['${pk_db_fields.join(
                "','",
            )}'], transaction: t});`;
        }
        console.log("FK")
        console.log(fk_model_fields)
        console.log(fk_db_fields)
        for (const field of fk_model_fields) {
            //если fk нету в дб -> добавляем
            if (!fk_db_fields.includes(field)) {
                let model_ref = this.getModelReference(
                    tableInModel[field].references as {
                        model: { tableName: string; schema: string } | string;
                        key: string;
                    },
                );
                res_up_string.add_constr_string += `await queryInterface.addConstraint({tableName: '${table_name}', schema: '${table_schema}'}, { type: 'FOREIGN KEY', fields: ['${field}'],references: { table: { tableName: '${
                    model_ref.model.tableName
                }', schema: '${model_ref.model.schema}' },field: '${model_ref.key}',}, onDelete: '${
                    tableInModel[field].onDelete
                }',onUpdate: '${
                    tableInModel[field].onUpdate
                }', name: '${this.getConstraintNameByModel(
                    table_name,
                    table_schema,
                    field,
                    'fkey',
                )}',transaction: t});`;
                res_down_string.remove_constr_string += `await queryInterface.removeConstraint({tableName: '${table_name}', schema: '${table_schema}'}, '${this.getConstraintNameByModel(
                    table_name,
                    table_schema,
                    field,
                    'fkey',
                )}', {transaction: t});`;
            } else {
                if (
                    JSON.stringify(
                        this.getModelReference(
                            tableInModel[field].references as {
                                model: { tableName: string; schema: string } | string;
                                key: string;
                            },
                        ),
                    ) !== JSON.stringify(tableInDb[field].references)
                ) {
                   
                    //console.log(tableInDb[field].references)
                    let model_ref = this.getModelReference(
                        tableInModel[field].references as {
                            model: { tableName: string; schema: string } | string;
                            key: string;
                        },
                    );
                    res_up_string.remove_constr_string += `await queryInterface.removeConstraint({tableName: '${table_name}', schema: '${table_schema}'}, '${tableInDb[field].fk_name}', {transaction: t});`;
                    res_up_string.add_constr_string += `await queryInterface.addConstraint({tableName: '${table_name}', schema: '${table_schema}'}, { type: 'FOREIGN KEY', fields: ['${field}'],references: { table: { tableName: '${
                        model_ref.model.tableName
                    }', schema: '${model_ref.model.schema}' },field: '${
                        model_ref.key
                    }',}, onDelete: '${tableInModel[field].onDelete}',onUpdate: '${
                        tableInModel[field].onUpdate
                    }',name: '${this.getConstraintNameByModel(
                        table_name,
                        table_schema,
                        field,
                        'fkey',
                    )}',transaction: t});`;
                    res_down_string.remove_constr_string += `await queryInterface.removeConstraint({tableName: '${table_name}', schema: '${table_schema}'}, '${this.getConstraintNameByModel(
                        table_name,
                        table_schema,
                        field,
                        'fkey',
                    )}', {transaction: t});`;
                    res_down_string.add_constr_string += `await queryInterface.addConstraint({tableName: '${table_name}', schema: '${table_schema}'}, { type: 'FOREIGN KEY', fields: ['${field}'], references: { table: { tableName: '${tableInDb[field].references.model.tableName}', schema: '${tableInDb[field].references.model.schema}'},field: '${tableInDb[field].references.key}',}, onDelete: '${tableInDb[field].onDelete}',onUpdate: '${tableInDb[field].onUpdate}',name: '${tableInDb[field].fk_name}',transaction: t});`;
                }
            }
        }
        for (const field of fk_db_fields) {
            if (!fk_model_fields.includes(field)) {
                //no fk in model -> delete fk from db
                res_up_string.remove_constr_string += `await queryInterface.removeConstraint({tableName: '${table_name}', schema: '${table_schema}'}, '${tableInDb[field].fk_name}', {transaction: t});`;
                res_down_string.add_constr_string += `await queryInterface.addConstraint({tableName: '${table_name}', schema: '${table_schema}'}, { type: 'FOREIGN KEY', fields: ['${field}'],references: { table: { tableName: '${tableInDb[field].references.model.tableName}', schema: '${tableInDb[field].references.model.schema}'},field: '${tableInDb[field].references.key}',}, onDelete: '${tableInDb[field].onDelete}',onUpdate: '${tableInDb[field].onUpdate}',transaction: t});`;
            }
        }
        //UNIQUE
        let model_composite_unique_list: { [key: string]: Array<string> } = {};
        let db_unique_list: { [key: string]: Array<string> } = {};
        for (const field of unique_model_fields) {
            if (typeof tableInModel[field].unique === typeof {}) {
                if (
                    model_composite_unique_list[
                        (
                            tableInModel[field].unique as unknown as {
                                name: string;
                                msg: string;
                            }
                        ).name
                    ] === undefined
                )
                    model_composite_unique_list[
                        (
                            tableInModel[field].unique as unknown as {
                                name: string;
                                msg: string;
                            }
                        ).name
                    ] = [];
                model_composite_unique_list[
                    (
                        tableInModel[field].unique as unknown as {
                            name: string;
                            msg: string;
                        }
                    ).name
                ].push(field);
            } else if (typeof tableInModel[field].unique === typeof true) {
                if (
                    model_composite_unique_list[
                        this.getConstraintNameByModel(table_name, table_schema, field, 'key')
                    ] === undefined
                )
                    model_composite_unique_list[
                        this.getConstraintNameByModel(table_name, table_schema, field, 'key')
                    ] = [];
                model_composite_unique_list[
                    this.getConstraintNameByModel(table_name, table_schema, field, 'key')
                ].push(field);
            }
        }

        let keys_to_delete: Array<string> = [];
        for (const item in model_composite_unique_list) {
            if (
                model_composite_unique_list[item].length > 1 ||
                item !==
                    this.getConstraintNameByModel(
                        table_name,
                        table_schema,
                        model_composite_unique_list[item][0],
                        'key',
                    )
            ) {
                let tmp: Array<string> = [];
                for (const field of model_composite_unique_list[item]) {
                    tmp.push(field);
                }
                keys_to_delete.push(item);
                model_composite_unique_list[
                    this.getConstraintNameOfCompositeKey(table_name, table_schema, tmp, 'key')
                ] = [];
                for (const i of tmp) {
                    model_composite_unique_list[
                        this.getConstraintNameOfCompositeKey(table_name, table_schema, tmp, 'key')
                    ].push(i);
                }
            }
        }
        for (const i of keys_to_delete) delete model_composite_unique_list[i];

        for (const field of unique_db_fields) {
            if (db_unique_list[tableInDb[field].unique_name as string] === undefined)
                db_unique_list[tableInDb[field].unique_name as string] = [];
            db_unique_list[tableInDb[field].unique_name as string].push(field);
        }

        for (const constr_name in model_composite_unique_list) {
            if (!Object.keys(db_unique_list).includes(constr_name)) {
                //db doesnt have this unique -> add
                res_up_string.add_constr_string += `await queryInterface.addConstraint({tableName: '${table_name}', schema: '${table_schema}'}, {fields: ['${model_composite_unique_list[
                    constr_name
                ].join("','")}'],type: 'UNIQUE',name: '${this.getConstraintNameOfCompositeKey(
                    table_name,
                    table_schema,
                    model_composite_unique_list[constr_name],
                    'key',
                )}',transaction: t
                });`;
                res_down_string.remove_constr_string += `await queryInterface.removeConstraint({tableName: '${table_name}', schema: '${table_schema}'}, '${this.getConstraintNameOfCompositeKey(
                    table_name,
                    table_schema,
                    model_composite_unique_list[constr_name],
                    'key',
                )}', {transaction: t});`;
            }
        }
        for (const constr_name in db_unique_list) {
            if (!Object.keys(model_composite_unique_list).includes(constr_name)) {
                //model doesnt have this unique -> remove
                res_up_string.remove_constr_string += `await queryInterface.removeConstraint({tableName: '${table_name}', schema: '${table_schema}'}, '${constr_name}', {transaction: t});`;
                res_down_string.add_constr_string += `await queryInterface.addConstraint({tableName: '${table_name}', schema: '${table_schema}'}, {fields: ['${db_unique_list[
                    constr_name
                ].join("','")}'],type: 'UNIQUE',name: '${constr_name}',transaction: t,});`;
            }
        }
        console.log("CONSTRAINTS RESULT")
        console.log(res_up_string, res_down_string)
        return { res_up_string, res_down_string };
    }

    // private static async getStringOfIndexes(
    //     table_schema: string,
    //     table_name: string,
    //     tableInModel: {
    //         readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
    //     },
    //     tableInDb: TableToModel,
    //     sequelize: Sequelize
    // ) { 
    //     let res_string: { up_string: string, down_string: string} = { up_string: '', down_string: ''};
    //     let db_indexes: {tableName: string, indexName: string, indexeDef: string}[] = (await DbService.getTableIndexes(table_schema, table_name)).at(0) as {tableName: string, indexName: string, indexeDef: string}[];
    //     let curr_model = ModelService.getModelByTableName(sequelize, table_name, table_schema);
    //     for(const model_index of curr_model.options.indexes as IndexesOptions[]) {
    //         if (!db_indexes.find((element) => element.indexName === model_index.name)) {
    //             // добавляем индекс
    //         }
    //         else {
    //             //пересоздаем индекс
    //         } 
    //     }
    //     for(const db_index of db_indexes) {
    //         if (!((curr_model.options.indexes as IndexesOptions[]).find((element) => element.name === db_index.indexName))) {
    //             // удаляем индекс
    //         }
    //     }

    //     console.log("INDEXES")
    //     console.log(this.getQueryCreateIndexString(table_name, table_schema, ModelService.getModelByTableName(sequelize, table_name, table_schema), sequelize));
    // }
    
    private static getQueryCreateIndexString(table_name: string, table_schema: string, model: ModelCtor<Model<any, any>>, sequelize: Sequelize) {
        let index_strings: { [x: string]: string } = {};
        let model_indexes: readonly IndexesOptions[] = model.options.indexes as IndexesOptions[];
        for(const index of model_indexes) {
            index_strings[index.name as string] = '';  
            index_strings[index.name as string] += `CREATE `;
            if(index.unique) 
                index_strings[index.name as string] += `UNIQUE `;
            index_strings[index.name as string] += `INDEX "${index.name}" ON "${table_schema}"."${table_name}" `;
            if(index.using === undefined)
                index_strings[index.name as string] += `USING BTREE `;
            else
                index_strings[index.name as string] += `USING ${index.using} (`;
            if(typeof index.fields === typeof '') {
                index_strings[index.name as string] += `${index.fields})`
            }
            else {
                for(const [i, field] of (index.fields as {
                    name: string;
                    length?: number | undefined;
                    order?: "ASC" | "DESC" | undefined;
                    collate?: string | undefined;
                    operator?: string | undefined;
                }[]).entries()) {
                    let tmp_field = field as {
                        name: string;
                        length?: number | undefined;
                        order?: "ASC" | "DESC" | undefined;
                        collate?: string | undefined;
                        operator?: string | undefined;
                    }
                    index_strings[index.name as string] += `"${tmp_field.name}" `;
                    if(tmp_field.collate)
                        index_strings[index.name as string] += `COLLATE "${tmp_field.collate}" `;
                    if(tmp_field.operator)
                        index_strings[index.name as string] += `${tmp_field.operator} `;
                    if(tmp_field.order)
                        index_strings[index.name as string] += `${tmp_field.order} `;
                    if(i !== index.fields?.length as number - 1)
                        index_strings[index.name as string] += `, `;
                }
            }
            index_strings[index.name as string] += `) `;
            index_strings[index.name as string] += sequelize.literal('col1 > 2'); //here

            if(index.where) {
                index_strings[index.name as string] += `WHERE (`;
                for(const i in index.where) {
                }
                index_strings[index.name as string] += `)`;
            }
        }
        return index_strings;
    }

    private static getConstraintNameOfCompositeKey(
        table_name: string,
        table_schema: string,
        fields: Array<string>,
        suffix: string,
    ) {
        let res_string = '';
        //if(table_schema === 'public')
        res_string = `${table_name}_`;
        //else
        //    res_string = `${table_schema}.${table_name}_`
        for (const field of fields) {
            res_string += `${field}_`;
        }
        res_string += `${suffix}`;
        return res_string;
    }
    private static getConstraintNameByModel(
        table_name: string,
        table_schema: string,
        column_name: string,
        suffix: string,
    ): string {
        let res_string = '';
        //if(table_schema === 'public')
        res_string = `${table_name}_`;
        //else
        //    res_string = `${table_schema}.${table_name}_`
        if (suffix === 'pkey') return res_string + `${suffix}`;
        return res_string + `${column_name}_${suffix}`;
    }

    static getModelReference(model_references: {
        model: { tableName: string; schema: string } | string;
        key: string;
    }) {
        let res: any = {};
        if (typeof model_references.model === typeof {}) {
            res.model = model_references.model as {
                tableName: string;
                schema: string;
            };
            res.key = model_references.key;
        } else if (typeof model_references.model === typeof '') {
            res.model = {
                tableName: model_references.model as string,
                schema: 'public',
            };
            res.key = model_references.key;
        }
        return res as {
            model: { tableName: string; schema: string };
            key: string;
        };
    }

    static getUpStringToAddTable(
        model: ModelCtor<Model<any, any>> | undefined,
        model_schema: string | undefined,
        table_name: string,
        table_schema: string
    ): string {
        //console.log('GENERATE STRING SCHEMA NAME');
        let description = model?.getAttributes();
        let res_string = `await queryInterface.createTable({tableName: '${table_name}', schema: '${table_schema}'},{`;
        res_string += ModelService.getModelColumnsAsString(description);
        res_string += `},{ transaction: t, schema: '${model_schema}'});`;
        return res_string;
    }

    static async getDownStringToAddTable(
        sequelize: Sequelize,
        table_schema: string,
        table_name: string,
    ): Promise<string> {
        let res_string = `await queryInterface.createTable({tableName: '${table_name}', schema: '${table_schema}'},{`;
        let attributes = await DbService.tableToModelInfo(sequelize, table_schema, table_name);
        //let options_to_except: Array<string> = [];
        for (const column in attributes) {
            let options: ModelAttribute = attributes[column];
            res_string += `${column}:`;
            /*for(const opt in options) {
                if(!options_to_except.includes(opt))
                res_string += `${opt}: `
            }*/
            options.unique_name = undefined;
            options.fk_name = undefined;
            options.pk_name = undefined;
            options.foreignKey = undefined;
            res_string += `${JSON.stringify(options)}, `;
            res_string = res_string.replace(
                /"\btype":"Sequelize.\b[^"]*"/g,
                `"type":${options.type}`,
            );
            //res_string = res_string.replace(/"\bunique_name":"\b[^"]*"/g, '');
            //res_string = res_string.replace(/"\bpk_name":"\b[^"]*"/g, '');
            //res_string = res_string.replace(/"\bfk_name":"\b[^"]*"/g, '');
        }
        res_string += `},{ transaction: t, schema: '${table_schema}'});`;

        return Promise.resolve(res_string);
    }

    static getUpStringToDeleteTable(model_schema: string | undefined, table_name: string, is_cascade: boolean) {
        if(is_cascade)
            return `await queryInterface.dropTable({ tableName: '${table_name}', schema: '${model_schema}'},{ cascade: true, transaction: t });`;
        return `await queryInterface.dropTable({ tableName: '${table_name}', schema: '${model_schema}'},{ transaction: t });`;
    }
}
