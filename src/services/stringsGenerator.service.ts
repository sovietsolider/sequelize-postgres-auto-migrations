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
import { ModelAttributeColumnReferencesOptions } from 'sequelize';
import { FileService } from './file.service';

export class StringsGeneratorService {
    sequelize: Sequelize;
    migration_options: MigrationOptions | undefined;
    dbService: DbService;
    modelService: ModelService;
    constructor(_sequelize: Sequelize, dbService: DbService, modelService: ModelService) {
        this.sequelize = _sequelize;
        this.dbService = dbService;
        this.modelService = modelService;
    }
    async getStringsToChangeTable(
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

        let tableInDb: TableToModel = await this.dbService.tableToModelInfo(
            sequelize,
            table_schema,
            table_name,
        );
        let tableInModel = (
            this.modelService.getModelByTableName(sequelize, table_name, table_schema) as ModelCtor<
                Model<any, any>
            >
        ).getAttributes();
        let changed_columns = [];
        const model_columns_names = this.modelService.getModelAttributesNames(tableInModel);
        for (const column in tableInModel) {
            let real_column_name = tableInModel[column].field as string;
            if (Object.keys(tableInDb).includes(real_column_name)) {
                let columns_different = false;
                let tmp_up_string = '';
                let tmp_down_string = '';
                tmp_up_string = `await queryInterface.changeColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${real_column_name}', {`;
                tmp_down_string = `await queryInterface.changeColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${real_column_name}', {`;
                tmp_up_string += `type: ${this.modelService.getTypeByModelAttr(
                    tableInModel[column].type,
                )},`;
                tmp_down_string += `type: ${tableInDb[real_column_name].type},`;
                if (
                    this.modelService.getTypeByModelAttr(tableInModel[column].type) !==
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
                    tmp_up_string += `allowNull: ${model_allow_null},`;
                    tmp_down_string += `allowNull: ${tableInDb[real_column_name].allowNull},`;
                    columns_different = true;
                }
                //console.log("AUTO INCREMENT")
                //console.log(tableInModel[column].autoIncrement)
                //console.log(tableInDb[real_column_name].autoIncrement)
                if (
                    tableInModel[column].autoIncrement !== tableInDb[real_column_name].autoIncrement
                ) {
                    tmp_up_string += `autoIncrement: ${tableInModel[column].autoIncrement},`;
                    tmp_down_string += `autoIncrement: ${tableInDb[real_column_name].autoIncrement},`;
                    columns_different = true;
                }
                if (
                    tableInModel[column].defaultValue !== tableInDb[real_column_name].defaultValue
                ) {
                    tmp_up_string += `defaultValue: ${JSON.stringify(
                        tableInModel[column].defaultValue,
                    )},`;
                    tmp_down_string += `defaultValue: ${tableInDb[real_column_name].defaultValue},`;

                    columns_different = true;
                }

                tmp_up_string += '},{ transaction: t });';
                tmp_down_string += '},{ transaction: t});';
                console.log("COLUMNS")
                console.log(tmp_up_string)
                console.log(columns_different)
                if (!columns_different) {
                    tmp_up_string = '';
                    tmp_down_string = '';
                }
                else {
                    changed_columns.push(real_column_name);
                    up_string.change_column_string += tmp_up_string;
                    down_string.change_column_string += tmp_down_string;
                }
            } else {
                //column is missing in Db -> add
                up_string.add_column_string += `await queryInterface.addColumn({tableName: '${table_name}', schema: '${table_schema}'}, '${real_column_name}', {`;
                up_string.add_column_string += this.modelService.getModelColumnDescriptionAsString(
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
        //let index_strings = await this.getStringOfIndexes(table_schema, table_name, sequelize);
        //res_string.up_string += index_strings.up_string.remove_index_string;
        res_string.up_string += (await this.comparePkConstraint(
            table_schema,
            table_name,
            tableInModel,
            tableInDb,
            changed_columns,
            sequelize
        )).res_up_string.remove_constr_string; //удаление ограничений
        res_string.up_string += up_string.remove_column_string; //удаление атрибутов
        res_string.up_string += up_string.add_column_string; //добавление атрибутов
        res_string.up_string += up_string.change_column_string; //изменение атрибутов
        //res_string.up_string += index_strings.up_string.add_index_string; //добавление индексов
        res_string.up_string += (await this.comparePkConstraint(
            table_schema,
            table_name,
            tableInModel,
            tableInDb,
            changed_columns,
            sequelize
        )).res_up_string.add_constr_string; //добавление ограничений
        
        //res_string.down_string += index_strings.down_string.remove_index_string; //удаление индексов
        res_string.down_string += (await this.comparePkConstraint(
            table_schema,
            table_name,
            tableInModel,
            tableInDb,
            changed_columns,
            sequelize
        )).res_down_string.remove_constr_string; //удаление ограничений
        res_string.down_string += down_string.remove_column_string; //удаление атрибутов
        res_string.down_string += down_string.add_column_string; //добавление атрибутов
        res_string.down_string += down_string.change_column_string; //изменение атрибутов
        //res_string.down_string += index_strings.down_string.add_index_string; //добавление индексов
        res_string.down_string += (await this.comparePkConstraint(
            table_schema,
            table_name,
            tableInModel,
            tableInDb,
            changed_columns,
            sequelize
        )).res_down_string.add_constr_string; //добавление ограничений
        console.log("RES STRING GEN")
        console.log(up_string)
        return Promise.resolve({
            upString: res_string.up_string,
            downString: res_string.down_string,
        });
    }

    private async comparePkConstraint(
        table_schema: string,
        table_name: string,
        tableInModel: {
            readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
        },
        tableInDb: TableToModel,
        changed_columns: Array<string>,
        sequelize: Sequelize
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
        console.log("CHANGED COLUMNS")
        console.log(changed_columns)
        let pk_model_fields: Array<string> = [];
        let pk_db_fields: Array<string> = [];
        let fk_model_fields: Array<string> = [];
        let fk_db_fields: Array<string> = [];
        let unique_model_fields: Array<string> = [];
        let unique_db_fields: Array<string> = [];
        let fk_removed: {[x: string]: Boolean } = {};
        for (const column in tableInModel) {
            let real_column_name = tableInModel[column].field as string;
            if (tableInModel[column].primaryKey) pk_model_fields.push(real_column_name);
            if (tableInModel[column].references) fk_model_fields.push(real_column_name);
            if (tableInModel[column].unique) unique_model_fields.push(real_column_name);
        }
        for (const column in tableInDb) {
            if (tableInDb[column].primaryKey) pk_db_fields.push(column);
            if (tableInDb[column].foreignKey) fk_db_fields.push(column);
            if (tableInDb[column].unique) unique_db_fields.push(column);
        }
        console.log("TABLES IN GENERATOR")
        console.log(unique_model_fields)
        console.log(unique_db_fields)
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
            (JSON.stringify(pk_model_fields) !== JSON.stringify(pk_db_fields) || pk_model_fields.some(r => changed_columns.includes(r))) &&
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
        for(const field of changed_columns) { //если атр был изменён, сбрасываем fk для изменения
            let is_ref = this.isReferenced(table_name, table_schema, field, sequelize.models as {[key: string]: ModelCtor<Model<any, any>>;});
            if(is_ref) {
                fk_removed[is_ref.columnName] = true;
                let model_ref = this.modelService.getModelReference(
                is_ref.column.references as {
                    model: { tableName: string; schema: string } | string;
                        key: string;
                },
                );
                let ref_table = await this.dbService.tableToModelInfo(sequelize, is_ref.schema, is_ref.tableName);
                res_up_string.remove_constr_string += `await queryInterface.removeConstraint({tableName: '${is_ref.tableName}', schema: '${is_ref.schema}'}, '${ref_table[is_ref.columnName].fk_name}', {transaction: t});`;
                res_up_string.add_constr_string += `await queryInterface.addConstraint({tableName: '${is_ref.tableName}', schema: '${is_ref.schema}'}, { type: 'FOREIGN KEY', fields: ['${is_ref.columnName}'],references: { table: { tableName: '${
                    model_ref.model.tableName
                }', schema: '${model_ref.model.schema}' },field: '${
                    model_ref.key
                }',}, onDelete: '${ref_table[is_ref.columnName].onDelete}',onUpdate: '${
                    ref_table[is_ref.columnName].onUpdate
                }',name: '${this.getConstraintNameByModel(
                    table_name,
                    table_schema,
                    is_ref.columnName,
                    'fkey',
                )}',transaction: t});`;
                res_down_string.remove_constr_string += `await queryInterface.removeConstraint({tableName: '${is_ref.tableName}', schema: '${is_ref.schema}'}, '${this.getConstraintNameByModel(
                    table_name,
                    table_schema,
                    is_ref.columnName,
                    'fkey',
                )}', {transaction: t});`;
                res_down_string.add_constr_string += `await queryInterface.addConstraint({tableName: '${is_ref.tableName}', schema: '${is_ref.schema}'}, { type: 'FOREIGN KEY', fields: ['${is_ref.columnName}'], references: { table: { tableName: '${ref_table[is_ref.columnName].references.model.tableName}', schema: '${ref_table[is_ref.columnName].references.model.schema}'},field: '${ref_table[is_ref.columnName].references.key}',}, onDelete: '${ref_table[is_ref.columnName].onDelete}',onUpdate: '${ref_table[is_ref.columnName].onUpdate}',name: '${ref_table[is_ref.columnName].fk_name}',transaction: t});`;
            }
        }
        

        for (const field of fk_model_fields) {
            //если fk нету в дб -> добавляем
            if (!fk_db_fields.includes(field)) {
                let model_ref = this.modelService.getModelReference(
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
                console.log("RULES")
                if (((
                    JSON.stringify(
                        this.modelService.getModelReference(
                            tableInModel[field].references as {
                                model: { tableName: string; schema: string } | string;
                                key: string;
                            },
                        ),
                    ) !== JSON.stringify(tableInDb[field].references)) || (tableInModel[field].onDelete !== tableInDb[field].onDelete) || (tableInModel[field].onUpdate !== tableInDb[field].onUpdate) || fk_model_fields.some(r => changed_columns.includes(r) 
                    )) && !fk_removed[field]
                ) {
                    //console.log(tableInDb[field].references)
                    let model_ref = this.modelService.getModelReference(
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
        console.log("FK DB FIELD")
            console.log(fk_db_fields)
            console.log(fk_model_fields);
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
        return Promise.resolve({ res_up_string, res_down_string });
    }

    isReferenced(table_name: string, table_schema: string, column_name: string, models: {
        [key: string]: ModelCtor<Model<any, any>>;
    }) {
        console.log("IS REFERENCED")
        console.log(column_name);
        console.log(models)
        for(const model in models) {
            let columns = models[model].getAttributes();
            console.log("COLUMNS")
            for(const attr in columns) {
                console.log(columns[attr])
                if(columns[attr].references) {
                    let curr_ref = this.modelService.getModelReference(columns[attr].references as { model: string | { tableName: string; schema: string; }; key: string; })
                    if(curr_ref.model.schema === table_schema && curr_ref.model.tableName == table_name && curr_ref.key === column_name) {
                        if(typeof models[model].getTableName() === typeof '')
                            return {columnName: attr, column: columns[attr], tableName: models[model].getTableName(), schema: 'public'}
                        else    
                            return {columnName: attr, column: columns[attr], tableName: (models[model].getTableName() as any).tableName, schema: (models[model].getTableName() as any).schema} 
                    }
                }
            }
        }
        return false;
    }

    async getStringOfIndexes(
         table_schema: string,
         table_name: string,
         sequelize: Sequelize
     ) { 
        let up_string: {
            add_index_string: string;
            remove_index_string: string;
        } = {
            add_index_string: '',
            remove_index_string: '',
        };
        let down_string: {
            add_index_string: string;
            remove_index_string: string;
        } = {
            add_index_string: '',
            remove_index_string: '',
        };
        let db_raw_indexes: {tableName: string, indexName: string, indexDef: string}[] = (await this.dbService.getTableIndexes(table_schema, table_name, sequelize)).at(0) as {tableName: string, indexName: string, indexDef: string}[];
        let db_indexes: {[x: string]: {tableName: string, indexName: string, indexDef: string}} = {};
        let curr_constraints = (await sequelize.query(this.dbService.getColumnsConstraintsSchemaInfo(table_schema, table_name))).at(0) as {constraint_type: string, table_schema: string, constraint_name: string, table_name: string, column_name: string, foreign_table_schema: string, foreign_table_name: string, foreign_column_name:string}[];
        
        console.log("CURR CONSTAINTS")
        console.log(curr_constraints);
        for(const raw_index of db_raw_indexes) {
            db_indexes[raw_index.indexName] = raw_index;
            if(raw_index.indexName.match(/.*_pkey/)) 
                delete db_indexes[raw_index.indexName];
            for(const constr of curr_constraints) {
                if(constr.constraint_name == raw_index.indexName && constr.constraint_type === 'UNIQUE')
                    delete db_indexes[raw_index.indexName];
            }            
        }
        console.log("DB INDEXES")
        console.log(db_indexes)
        let curr_model = this.modelService.getModelByTableName(sequelize, table_name, table_schema);
        let model_create_indexes_strings = this.getQueryCreateIndexString(table_name, table_schema, this.modelService.getModelByTableName(sequelize, table_name, table_schema), sequelize);
         
        for(const model_index of curr_model.options.indexes as IndexesOptions[]) {
            let tmp_model_index = JSON.parse(JSON.stringify(model_index));
            tmp_model_index.transaction = 't';
            if (!Object.keys(db_indexes).includes(model_index.name as string)) {
                up_string.add_index_string+= `await queryInterface.addIndex({tableName: '${table_name}', schema: '${table_schema}'}, ${JSON.stringify(tmp_model_index).replace(/"\btransaction":"t"/g, '"transaction": t')});`
                down_string.remove_index_string += `await queryInterface.removeIndex({tableName: '${table_name}', schema: '${table_schema}'}, '${model_index.name}', { transaction: t });`;
                // добавляем индекс
            }
            else if(model_create_indexes_strings[model_index.name as string].replace(/\s|"/g, "") !== db_indexes[model_index.name as string].indexDef.replace(/\s|"/g, "")){
                up_string.remove_index_string += `await queryInterface.removeIndex({tableName: '${table_name}', schema: '${table_schema}'}, '${model_index.name}', { transaction: t });`;
                up_string.add_index_string += `await queryInterface.addIndex({tableName: '${table_name}', schema: '${table_schema}'}, ${JSON.stringify(tmp_model_index).replace(/"\btransaction":"t"/g, '"transaction": t')});`
                down_string.remove_index_string += `await queryInterface.removeIndex({tableName: '${table_name}', schema: '${table_schema}'}, '${model_index.name}', { transaction: t });`;
                down_string.add_index_string += `await queryInterface.sequelize.query('${db_indexes[model_index.name as string].indexDef}', {transaction: t});`
            } 
        }
        for(const db_index in db_indexes) {
            if (!((curr_model.options.indexes as IndexesOptions[]).find((element) => element.name === db_index))) {
                up_string.remove_index_string += `await queryInterface.removeIndex({tableName: '${table_name}', schema: '${table_schema}'}, '${db_index}', { transaction: t });`;
                down_string.add_index_string += `await queryInterface.sequelize.query('${db_indexes[db_index].indexDef}', {transaction: t});`
            }
        }
        console.log("GET INDEXES STRINGS")
        console.log(up_string)
        console.log(down_string)
        return {up_string, down_string};
    }
    
    private getQueryCreateIndexString(table_name: string, table_schema: string, model: ModelCtor<Model<any, any>>, sequelize: Sequelize) {
        let index_strings: { [x: string]: string } = {};
        let model_indexes: readonly IndexesOptions[] = model.options.indexes as IndexesOptions[];
        for(const index of model_indexes) {
            index_strings[index.name as string] = '';  
            index_strings[index.name as string] += `CREATE `;
            if(index.unique) 
                index_strings[index.name as string] += `UNIQUE `;
            index_strings[index.name as string] += `INDEX "${index.name}" ON "${table_schema}"."${table_name}" `;
            if(index.using === undefined)
                index_strings[index.name as string] += `USING btree (`;
            else
                index_strings[index.name as string] += `USING ${index.using.toLowerCase()} (`;
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
            index_strings[index.name as string] = index_strings[index.name as string].replace(/\s|"/g, "");
            
        }
        console.log("FINAL INDEX STRING")
        return index_strings;
    }

    private getConstraintNameOfCompositeKey(
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
    private  getConstraintNameByModel(
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

    

    getUpStringToAddTable(
        model: ModelCtor<Model<any, any>> | undefined,
        model_schema: string | undefined,
        table_name: string,
        table_schema: string
    ): string {
        //console.log('GENERATE STRING SCHEMA NAME');
        let description = model?.getAttributes();
        let res_string = `await queryInterface.createTable({tableName: '${table_name}', schema: '${table_schema}'},{`;
        res_string += this.modelService.getModelColumnsAsString(description);
        res_string += `},{ transaction: t, schema: '${model_schema}'});`;
        return res_string;
    }

    async getDownStringToAddTable(
        sequelize: Sequelize,
        table_schema: string,
        table_name: string,
    ): Promise<string> {
        let res_string = `await queryInterface.createTable({tableName: '${table_name}', schema: '${table_schema}'},{`;
        let attributes = await this.dbService.tableToModelInfo(sequelize, table_schema, table_name);
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

    getUpStringToDeleteTable(model_schema: string | undefined, table_name: string, is_cascade: boolean) {
        if(is_cascade)
            return `await queryInterface.dropTable({ tableName: '${table_name}', schema: '${model_schema}'},{ cascade: true, transaction: t });`;
        return `await queryInterface.dropTable({ tableName: '${table_name}', schema: '${model_schema}'},{ transaction: t });`;
    }
}
