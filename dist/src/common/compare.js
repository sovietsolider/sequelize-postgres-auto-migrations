"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compare = void 0;
class Compare {
    dbService;
    modelService;
    sequelize;
    removed_fk = {};
    stringGeneratorService;
    constructor(_sequelize, _dbService, _modelService, _stringGeneratorService) {
        this.dbService = _dbService;
        this.sequelize = _sequelize;
        this.modelService = _modelService;
        this.stringGeneratorService = _stringGeneratorService;
    }
    async compareTables(sequelize, schema_tables, tables) {
        let upString = '';
        let downString = '';
        let order_to_add_ordinary_table = [];
        let referenced_tables = [];
        let order_to_add_constraint_table = [];
        let drop_tables_down_string = '';
        let addTablesStrings = {};
        let change_column_strings = {
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
        let index_strings = [];
        let remove_fk_strings = {
            up_string: { add_fk: '', remove_fk: '' },
            down_string: { add_fk: '', remove_fk: '' },
        };
        let res_up_unique_string = {
            add_constr_string: { pk: '', fk: '', unique: '' },
            remove_constr_string: { pk: '', fk: '', unique: '' },
        };
        let res_down_unique_string = {
            add_constr_string: { pk: '', fk: '', unique: '' },
            remove_constr_string: { pk: '', fk: '', unique: '' },
        };
        for (const table of tables) {
            let removed_fk_obj = await this.stringGeneratorService.getStringToDropFkBeforeChanging(table.table_name, table.table_schema, await this.stringGeneratorService.getChangedColumns(sequelize, table.table_schema, table.table_name), this.removed_fk);
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
                    let curr_ref = this.modelService.getModelReference(curr_model[col].references);
                    referenced_tables.push(JSON.stringify({
                        table_schema: curr_ref.model.schema,
                        table_name: curr_ref.model.tableName,
                    }));
                    order_to_add_constraint_table.push(JSON.stringify({
                        table_schema: table.table_schema,
                        table_name: table.table_name,
                    }));
                }
            }
            if (!has_ref)
                order_to_add_ordinary_table.push(JSON.stringify({
                    table_schema: table.table_schema,
                    table_name: table.table_name,
                }));
        }
        if (order_to_add_constraint_table.length > 1) {
            order_to_add_constraint_table.sort(this.dbService.cmpTablesByRefInModel(sequelize, this.modelService));
        }
        for (const table of tables) {
            index_strings.push(await this.stringGeneratorService.getStringOfIndexes(table.table_schema, table.table_name, sequelize));
            if (!schema_tables.find((element) => element.table_name === table?.table_name &&
                element.table_schema === table?.table_schema)) {
                //console.log(`Adding table: ${table.table_schema}.${table.table_name}`);
                let curr_model = this.modelService.getModelByTableName(sequelize, table?.table_name, table?.table_schema);
                addTablesStrings[JSON.stringify({
                    table_schema: table.table_schema,
                    table_name: table.table_name,
                })] = this.stringGeneratorService.getUpStringToAddTable(curr_model, table?.table_schema, table?.table_name, table.table_schema);
                this.stringGeneratorService.getStringToCompareUniqueConstraints(table.table_name, table.table_schema, curr_model.getAttributes(), res_up_unique_string, res_down_unique_string);
                let is_cascade = false;
                if (referenced_tables.includes(JSON.stringify({
                    table_schema: table.table_schema,
                    table_name: table.table_name,
                }))) {
                    is_cascade = true;
                }
                drop_tables_down_string += this.stringGeneratorService.getUpStringToDeleteTable(table?.table_schema, table?.table_name, is_cascade);
            }
            else {
                //если атр есть в бд и моделе -> изменяем
                let tmp_change_str = await this.stringGeneratorService.getStringsToChangeTable(sequelize, table.table_schema, table.table_name, this.removed_fk);
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
        let strings_to_delete_tables = await this.deleteMissingTablesFromDbString(sequelize, schema_tables, tables);
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
        let addIndexesDownString = [];
        for (const index of index_strings) {
            if (index.down_string.add_index_string !== '')
                addIndexesDownString.push(index.down_string.add_index_string);
        }
        return Promise.resolve({ upString, downString });
    }
    async deleteMissingTablesFromDbString(sequelize, schema_tables, tables) {
        let upString = '';
        let downString = '';
        let order_to_add_ordinary_table = [];
        let order_to_add_constraint_table = [];
        let tables_with_fk_to_cmp = {};
        let referenced_tables = [];
        let addTablesStrings = {};
        let index_strings = [];
        let res_up_unique_string = {
            add_constr_string: { pk: '', fk: '', unique: '' },
            remove_constr_string: { pk: '', fk: '', unique: '' },
        };
        let res_down_unique_string = {
            add_constr_string: { pk: '', fk: '', unique: '' },
            remove_constr_string: { pk: '', fk: '', unique: '' },
        };
        for (const table of schema_tables) {
            if (table.table_name !== 'SequelizeMeta') {
                let curr_table_info = await this.dbService.tableToModelInfo(sequelize, table.table_schema, table.table_name);
                let has_ref = false;
                for (const col in curr_table_info) {
                    if (curr_table_info[col].references) {
                        referenced_tables.push(JSON.stringify({
                            table_schema: curr_table_info[col].references.model.schema,
                            table_name: curr_table_info[col].references.model.tableName,
                        }));
                        tables_with_fk_to_cmp[JSON.stringify({
                            table_schema: table.table_schema,
                            table_name: table.table_name,
                        })] = curr_table_info;
                        order_to_add_constraint_table.push(JSON.stringify({
                            table_schema: table.table_schema,
                            table_name: table.table_name,
                        }));
                        has_ref = true;
                    }
                }
                if (!has_ref)
                    order_to_add_ordinary_table.push(JSON.stringify({
                        table_schema: table.table_schema,
                        table_name: table.table_name,
                    }));
            }
            index_strings.push(await this.stringGeneratorService.getStringOfIndexes(table.table_schema, table.table_name, sequelize));
        }
        if (order_to_add_constraint_table.length > 1) {
            order_to_add_constraint_table.sort(this.dbService.compareTablesByReferencesInDb(tables_with_fk_to_cmp, this.modelService));
        }
        for (const schema_table of schema_tables) {
            if (schema_table.table_name != 'SequelizeMeta') {
                if (!tables.find((element) => element.table_name === schema_table.table_name &&
                    element.table_schema === schema_table.table_schema)) {
                    //let curr_model = this.modelService.getModelByTableName(sequelize, schema_table.table_name, schema_table.table_schema);
                    let curr_db_table = await this.dbService.tableToModelInfo(sequelize, schema_table.table_schema, schema_table.table_name);
                    this.stringGeneratorService.getStringToCompareUniqueConstraints(schema_table.table_name, schema_table.table_schema, {}, res_up_unique_string, res_down_unique_string, curr_db_table);
                    /*console.log(
                        `Deleting table: ${schema_table.table_schema}.${schema_table.table_name}`,
                    );*/
                    //upString
                    let is_cascade = false;
                    if (referenced_tables.includes(JSON.stringify({
                        table_schema: schema_table.table_schema,
                        table_name: schema_table.table_name,
                    }))) {
                        is_cascade = true;
                    }
                    upString += this.stringGeneratorService.getUpStringToDeleteTable(schema_table.table_schema, schema_table.table_name, is_cascade);
                    //downString
                    addTablesStrings[JSON.stringify({
                        table_schema: schema_table.table_schema,
                        table_name: schema_table.table_name,
                    })] = await this.stringGeneratorService.getDownStringToAddTable(sequelize, schema_table.table_schema, schema_table.table_name);
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
exports.Compare = Compare;
//# sourceMappingURL=compare.js.map