import { Sequelize, Model, ModelCtor } from 'sequelize-typescript';
import { DbService } from '../services/db.service';
import { modelInfoType } from './interfaces';
import { ModelService } from '../services/model.service';
import { StringsGeneratorService } from '../services/stringsGenerator.service';
import { TableToModel } from './interfaces';
import { ModelAttributeColumnOptions } from 'sequelize';
export class Compare {
    dbService: DbService;
    modelService: ModelService;
    sequelize: Sequelize;
    removed_fk: { [x: string]: boolean } = {};
    stringGeneratorService: StringsGeneratorService;
    constructor(
        _sequelize: Sequelize,
        _dbService: DbService,
        _modelService: ModelService,
        _stringGeneratorService: StringsGeneratorService,
    ) {
        this.dbService = _dbService;
        this.sequelize = _sequelize;
        this.modelService = _modelService;
        this.stringGeneratorService = _stringGeneratorService;
    }
    async compareTables(
        sequelize: Sequelize,
        schema_tables: Array<any>,
        tables: modelInfoType[],
    ): Promise<{ upString: string; downString: string }> {
        let upString: string = '';
        let downString: string = '';
        let order_to_add_ordinary_table: Array<string> = [];
        let referenced_tables: Array<string> = [];
        let order_to_add_constraint_table: Array<string> = [];
        let drop_tables_down_string = '';
        let addTablesStrings: { [x: string]: string } = {};
        let change_column_strings: {
            upString: {
                change_column_string: string;
                add_column_string: string;
                remove_column_string: string;
                add_constraints_string: { fk: string; pk: string; unique: string };
                remove_constraints_string: { fk: string; pk: string; unique: string };
            };
            downString: {
                change_column_string: string;
                add_column_string: string;
                remove_column_string: string;
                add_constraints_string: { fk: string; pk: string; unique: string };
                remove_constraints_string: { fk: string; pk: string; unique: string };
            };
        } = {
            upString: {
                change_column_string: '',
                add_column_string: '',
                remove_column_string: '',
                add_constraints_string: { pk: '', fk: '', unique: '' },
                remove_constraints_string: { pk: '', fk: '', unique: '' },
            },
            downString: {
                change_column_string: '',
                add_column_string: '',
                remove_column_string: '',
                add_constraints_string: { pk: '', fk: '', unique: '' },
                remove_constraints_string: { pk: '', fk: '', unique: '' },
            },
        };
        let index_strings: Array<{
            up_string: {
                add_index_string: string;
                remove_index_string: string;
            };
            down_string: {
                add_index_string: string;
                remove_index_string: string;
            };
        }> = [];
        let remove_fk_strings: {
            up_string: {
                add_fk: string;
                remove_fk: string;
            };
            down_string: {
                add_fk: string;
                remove_fk: string;
            };
        } = {
            up_string: { add_fk: '', remove_fk: '' },
            down_string: { add_fk: '', remove_fk: '' },
        };
        let res_up_unique_string: {
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
        } = {
            add_constr_string: { pk: '', fk: '', unique: '' },
            remove_constr_string: { pk: '', fk: '', unique: '' },
        };
        let res_down_unique_string: {
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
        } = {
            add_constr_string: { pk: '', fk: '', unique: '' },
            remove_constr_string: { pk: '', fk: '', unique: '' },
        };
        for (const table of tables) {
            let removed_fk_obj = await this.stringGeneratorService.getStringToDropFkBeforeChanging(
                table.table_name,
                table.table_schema,
                await this.stringGeneratorService.getChangedColumns(
                    sequelize,
                    table.table_schema,
                    table.table_name,
                ),
                this.removed_fk,
            );
            remove_fk_strings.up_string.remove_fk +=
                removed_fk_obj.res_up_string.remove_constr_string;
            remove_fk_strings.up_string.add_fk += removed_fk_obj.res_up_string.add_constr_string;
            remove_fk_strings.down_string.remove_fk +=
                removed_fk_obj.res_down_string.remove_constr_string;
            remove_fk_strings.down_string.add_fk +=
                removed_fk_obj.res_down_string.add_constr_string;

            let curr_model = this.modelService
                .getModelByTableName(sequelize, table.table_name, table.table_schema)
                .getAttributes();
            let has_ref = false;
            for (const col in curr_model) {
                if (curr_model[col].references) {
                    has_ref = true;
                    let curr_ref = this.modelService.getModelReference(
                        curr_model[col].references as {
                            model:
                                | string
                                | {
                                      tableName: string;
                                      schema: string;
                                  };
                            key: string;
                        },
                    );
                    referenced_tables.push(
                        JSON.stringify({
                            table_schema: curr_ref.model.schema,
                            table_name: curr_ref.model.tableName,
                        }),
                    );
                    if(!order_to_add_constraint_table.includes(JSON.stringify({
                            table_schema: table.table_schema,
                            table_name: table.table_name,
                        }))) {
                            order_to_add_constraint_table.push(
                                JSON.stringify({
                                    table_schema: table.table_schema,
                                    table_name: table.table_name,
                                }),
                            );
                        }
                    
                }
            }
            if (!has_ref)
                order_to_add_ordinary_table.push(
                    JSON.stringify({
                        table_schema: table.table_schema,
                        table_name: table.table_name,
                    }),
                );
        }
        if (order_to_add_constraint_table.length > 1) {
            order_to_add_constraint_table.sort(
                this.dbService.cmpTablesByRefInModel(sequelize, this.modelService),
            );
        }

        for (const table of tables) {
            index_strings.push(
                await this.stringGeneratorService.getStringOfIndexes(
                    table.table_schema,
                    table.table_name,
                    sequelize,
                ),
            );
            if (
                !schema_tables.find(
                    (element) =>
                        element.table_name === table?.table_name &&
                        element.table_schema === table?.table_schema,
                )
            ) {
                //console.log(`Adding table: ${table.table_schema}.${table.table_name}`);
                let curr_model = this.modelService.getModelByTableName(
                    sequelize,
                    table?.table_name,
                    table?.table_schema,
                );
                //console.log(curr_model.getAttributes())
                addTablesStrings[
                    JSON.stringify({
                        table_schema: table.table_schema,
                        table_name: table.table_name,
                    })
                ] = this.stringGeneratorService.getUpStringToAddTable(
                    curr_model as ModelCtor<Model<any, any>> | undefined,
                    table?.table_schema,
                    table?.table_name,
                    table.table_schema,
                );

                this.stringGeneratorService.getStringToCompareUniqueConstraints(
                    table.table_name,
                    table.table_schema,
                    curr_model.getAttributes(),
                    res_up_unique_string,
                    res_down_unique_string,
                );
                let is_cascade = false;
                if (
                    referenced_tables.includes(
                        JSON.stringify({
                            table_schema: table.table_schema,
                            table_name: table.table_name,
                        }),
                    )
                ) {
                    is_cascade = true;
                }
                //console.log('AAAAAAA')
                drop_tables_down_string += await this.stringGeneratorService.getUpStringToDeleteTable(
                    sequelize,
                    table?.table_schema,
                    table?.table_name,
                    is_cascade,
                    true
                );
                
            } else {
                //если атр есть в бд и моделе -> изменяем
                let tmp_change_str = await this.stringGeneratorService.getStringsToChangeTable(
                    sequelize,
                    table.table_schema,
                    table.table_name,
                    this.removed_fk,
                );

                change_column_strings.upString.add_column_string +=
                    tmp_change_str.upString.add_column_string;
                change_column_strings.upString.change_column_string +=
                    tmp_change_str.upString.change_column_string;
                change_column_strings.upString.remove_column_string +=
                    tmp_change_str.upString.remove_column_string;

                change_column_strings.upString.add_constraints_string.fk +=
                    tmp_change_str.upString.add_constraints_string.fk;
                change_column_strings.upString.add_constraints_string.pk +=
                    tmp_change_str.upString.add_constraints_string.pk;
                change_column_strings.upString.add_constraints_string.unique +=
                    tmp_change_str.upString.add_constraints_string.unique;

                change_column_strings.upString.remove_constraints_string.fk +=
                    tmp_change_str.upString.remove_constraints_string.fk;
                change_column_strings.upString.remove_constraints_string.pk +=
                    tmp_change_str.upString.remove_constraints_string.pk;
                change_column_strings.upString.remove_constraints_string.unique +=
                    tmp_change_str.upString.remove_constraints_string.unique;

                change_column_strings.downString.add_column_string +=
                    tmp_change_str.downString.add_column_string;
                change_column_strings.downString.change_column_string +=
                    tmp_change_str.downString.change_column_string;
                change_column_strings.downString.remove_column_string +=
                    tmp_change_str.downString.remove_column_string;

                change_column_strings.downString.add_constraints_string.fk +=
                    tmp_change_str.downString.add_constraints_string.fk;
                change_column_strings.downString.add_constraints_string.pk +=
                    tmp_change_str.downString.add_constraints_string.pk;
                change_column_strings.downString.add_constraints_string.unique +=
                    tmp_change_str.downString.add_constraints_string.unique;

                change_column_strings.downString.remove_constraints_string.fk +=
                    tmp_change_str.downString.remove_constraints_string.fk;
                change_column_strings.downString.remove_constraints_string.pk +=
                    tmp_change_str.downString.remove_constraints_string.pk;
                change_column_strings.downString.remove_constraints_string.unique +=
                    tmp_change_str.downString.remove_constraints_string.unique;
            }
        }
        let strings_to_delete_tables = await this.deleteMissingTablesFromDbString(
            sequelize,
            schema_tables,
            tables,
        );
        for (const tableToAdd of order_to_add_ordinary_table) {
            //adding tables
            if (addTablesStrings[tableToAdd]) {
                upString += addTablesStrings[tableToAdd];
            }
        }
        for (const tableToAdd of order_to_add_constraint_table) {
            //adding tables with fk
            if (addTablesStrings[tableToAdd]) {
                upString += addTablesStrings[tableToAdd];
            }
        }
        upString += res_up_unique_string.add_constr_string.unique; //adding unique constraints after adding tables

        for (const index of index_strings) {
            upString += index.up_string.remove_index_string; //deleting index
        }
        upString += remove_fk_strings.up_string.remove_fk; // removing fk before changing
        upString += change_column_strings.upString.remove_constraints_string.fk; //remove constraints
        upString += change_column_strings.upString.remove_constraints_string.pk;
        upString += change_column_strings.upString.remove_constraints_string.unique;
        upString += change_column_strings.upString.remove_column_string; //removing columns
        upString += change_column_strings.upString.add_column_string; //adding columns
        upString += change_column_strings.upString.change_column_string; //changing columns
        for (const index of index_strings) {
            upString += index.up_string.add_index_string; //adding index
        }
        upString += change_column_strings.upString.add_constraints_string.pk; // adding constraints
        upString += change_column_strings.upString.add_constraints_string.unique;
        upString += remove_fk_strings.up_string.add_fk; //adding fk after changing
        upString += change_column_strings.upString.add_constraints_string.fk;
        upString += strings_to_delete_tables.upString; //deleting tables

        downString += strings_to_delete_tables.downString; //adding tables
        downString += res_down_unique_string.add_constr_string.unique; //adding unique constraints after adding tables
        downString += remove_fk_strings.down_string.remove_fk; //removing fk after changing
        downString += change_column_strings.downString.remove_constraints_string.fk; //removing constraints
        downString += change_column_strings.downString.remove_constraints_string.pk;
        downString += change_column_strings.downString.remove_constraints_string.unique;

        downString += change_column_strings.downString.remove_column_string; //removing columns
        downString += change_column_strings.downString.add_column_string; //adding columns
        downString += change_column_strings.downString.change_column_string; //change columns
        downString += change_column_strings.downString.add_constraints_string.pk; // adding constraints
        downString += change_column_strings.downString.add_constraints_string.unique;
        downString += remove_fk_strings.down_string.add_fk; //adding fk;
        downString += change_column_strings.downString.add_constraints_string.fk;
        for (const index of index_strings) {
            downString += index.down_string.remove_index_string; //deleting index down
        }
        downString += drop_tables_down_string;
        let addIndexesDownString: Array<string> = [];
        for (const index of index_strings) {
            if (index.down_string.add_index_string !== '')
                addIndexesDownString.push(index.down_string.add_index_string);
        }
        return Promise.resolve({ upString, downString });
    }

    private async deleteMissingTablesFromDbString(
        sequelize: Sequelize,
        schema_tables: Array<any>,
        tables: modelInfoType[],
    ): Promise<{ upString: string; downString: string }> {
        let upString: string = '';
        let downString: string = '';
        let order_to_add_ordinary_table: Array<string> = [];
        let order_to_add_constraint_table: Array<string> = [];
        let tables_with_fk_to_cmp: { [x: string]: TableToModel } = {};
        let referenced_tables: Array<string> = [];
        let addTablesStrings: { [x: string]: string } = {};
        let index_strings: Array<{
            up_string: {
                add_index_string: string;
                remove_index_string: string;
            };
            down_string: {
                add_index_string: string;
                remove_index_string: string;
            };
        }> = [];
        let res_up_unique_string: {
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
        } = {
            add_constr_string: { pk: '', fk: '', unique: '' },
            remove_constr_string: { pk: '', fk: '', unique: '' },
        };
        let res_down_unique_string: {
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
        } = {
            add_constr_string: { pk: '', fk: '', unique: '' },
            remove_constr_string: { pk: '', fk: '', unique: '' },
        };
        for (const table of schema_tables) {
            if (table.table_name !== 'SequelizeMeta') {
                let curr_table_info = await this.dbService.tableToModelInfo(
                    sequelize,
                    table.table_schema,
                    table.table_name,
                );
                let has_ref = false;
                for (const col in curr_table_info) {
                    if (curr_table_info[col].references) {
                        referenced_tables.push(
                            JSON.stringify({
                                table_schema: curr_table_info[col].references.model.schema,
                                table_name: curr_table_info[col].references.model.tableName,
                            }),
                        );
                        tables_with_fk_to_cmp[
                            JSON.stringify({
                                table_schema: table.table_schema,
                                table_name: table.table_name,
                            })
                        ] = curr_table_info;
                        if(!order_to_add_constraint_table.includes(JSON.stringify({
                            table_schema: table.table_schema,
                            table_name: table.table_name,
                        }))) {
                            order_to_add_constraint_table.push(
                                JSON.stringify({
                                    table_schema: table.table_schema,
                                    table_name: table.table_name,
                                }),
                            );
                        } 
                        has_ref = true;
                    }
                }
                if (!has_ref)
                    order_to_add_ordinary_table.push(
                        JSON.stringify({
                            table_schema: table.table_schema,
                            table_name: table.table_name,
                        }),
                    );
            }
            index_strings.push(
                await this.stringGeneratorService.getStringOfIndexes(
                    table.table_schema,
                    table.table_name,
                    sequelize,
                ),
            );
        }
        if (order_to_add_constraint_table.length > 1) {
            order_to_add_constraint_table.sort(
                this.dbService.compareTablesByReferencesInDb(
                    tables_with_fk_to_cmp,
                    this.modelService,
                ),
            );
        }
        for (const schema_table of schema_tables) {
            if (schema_table.table_name != 'SequelizeMeta') {
                if (
                    !tables.find(
                        (element) =>
                            element.table_name === schema_table.table_name &&
                            element.table_schema === schema_table.table_schema,
                    )
                ) {
                    //let curr_model = this.modelService.getModelByTableName(sequelize, schema_table.table_name, schema_table.table_schema);
                    let curr_db_table = await this.dbService.tableToModelInfo(
                        sequelize,
                        schema_table.table_schema,
                        schema_table.table_name,
                    );
                    this.stringGeneratorService.getStringToCompareUniqueConstraints(
                        schema_table.table_name,
                        schema_table.table_schema,
                        {},
                        res_up_unique_string,
                        res_down_unique_string,
                        curr_db_table,
                    );
                    /*console.log(
                        `Deleting table: ${schema_table.table_schema}.${schema_table.table_name}`,
                    );*/
                    //upString
                    let is_cascade = false;
                    if (
                        referenced_tables.includes(
                            JSON.stringify({
                                table_schema: schema_table.table_schema,
                                table_name: schema_table.table_name,
                            }),
                        )
                    ) {
                        is_cascade = true;
                    }
                    upString += await this.stringGeneratorService.getUpStringToDeleteTable(
                        sequelize,
                        schema_table.table_schema,
                        schema_table.table_name,
                        is_cascade,
                        false
                    );
                    
                    //downString
                    addTablesStrings[
                        JSON.stringify({
                            table_schema: schema_table.table_schema,
                            table_name: schema_table.table_name,
                        })
                    ] = await this.stringGeneratorService.getDownStringToAddTable(
                        sequelize,
                        schema_table.table_schema,
                        schema_table.table_name,
                    );
                }
            }
        }
        for (const tableToAdd of order_to_add_ordinary_table) {
            if (addTablesStrings[tableToAdd]) {
                downString += addTablesStrings[tableToAdd];
            }
        }
        for (const tableToAdd of order_to_add_constraint_table) {
            if (addTablesStrings[tableToAdd]) {
                downString += addTablesStrings[tableToAdd];
            }
        }
        downString += res_down_unique_string.add_constr_string.unique;
        for (const index of index_strings) {
            downString += index.down_string.add_index_string; //adding index down
        }
        return Promise.resolve({ upString, downString });
    }
}
