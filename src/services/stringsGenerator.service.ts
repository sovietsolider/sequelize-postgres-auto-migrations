import { Sequelize, Model, ModelCtor } from 'sequelize-typescript';
import { ModelAttributeColumnOptions } from 'sequelize';
import {
    SchemaColumns,
    SchemaColumnType,
    sqlToSeqTypes,
    TableToModel,
    ModelAttribute,
} from '../common/interfaces';
import { ModelService } from './model.service';
import { DbService } from './db.service';

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
        this.compareIndexesConstraints(table_schema, table_name, tableInModel, tableInDb);

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
        //FOREIGN KEYS
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

        return { res_up_string, res_down_string };
    }

    private static async compareIndexesConstraints(
        table_schema: string,
        table_name: string,
        tableInModel: {
            readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
        },
        tableInDb: TableToModel,
    ) { 
        let db_indexes = (await DbService.getTableIndexes(table_schema, table_name)).at(0);
        console.log("INDEXES")
        console.log(tableInModel)
        console.log(db_indexes);
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
    ): string {
        //console.log('GENERATE STRING SCHEMA NAME');
        let description = model?.getAttributes();
        let res_string = `await queryInterface.createTable("${table_name}",{`;
        res_string += ModelService.getModelColumnsAsString(description);
        res_string += `},{ transaction: t, schema: "${model_schema}"},);`;
        return res_string;
    }

    static async getDownStringToAddTable(
        sequelize: Sequelize,
        table_schema: string,
        table_name: string,
    ): Promise<string> {
        let res_string = `await queryInterface.createTable("${table_name}",{`;
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
            res_string += `${JSON.stringify(options)}, `;
            res_string = res_string.replace(
                /"\btype":"Sequelize.\b[^"]*"/g,
                `"type":${options.type}`,
            );
            //res_string = res_string.replace(/"\bunique_name":"\b[^"]*"/g, '');
            //res_string = res_string.replace(/"\bpk_name":"\b[^"]*"/g, '');
            //res_string = res_string.replace(/"\bfk_name":"\b[^"]*"/g, '');
        }
        res_string += `},{ transaction: t, schema: "${table_schema}"},);`;

        return Promise.resolve(res_string);
    }

    static getUpStringToDeleteTable(model_schema: string | undefined, table_name: string) {
        return `await queryInterface.dropTable({ tableName: '${table_name}', tableSchema: '${model_schema}'},{ transaction: t },);`;
    }
}
