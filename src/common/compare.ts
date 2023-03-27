import { Sequelize, Model, ModelCtor } from "sequelize-typescript";
import { DbService } from "../services/db.service";
import { modelInfoType } from "./interfaces";
import { ModelService } from "../services/model.service";
import { StringsGeneratorService } from "../services/stringsGenerator.service";
import { TableToModel } from "./interfaces";
export class Compare {
    dbService: DbService;
    modelService: ModelService
    sequelize: Sequelize;
    removed_fk: {[x: string]: boolean} = {};
    stringGeneratorService: StringsGeneratorService;
    constructor(_sequelize: Sequelize, _dbService: DbService, _modelService: ModelService, _stringGeneratorService: StringsGeneratorService) {
        this.dbService = _dbService;
        this.sequelize = _sequelize
        this.modelService = _modelService
        this.stringGeneratorService = _stringGeneratorService;
    }
    async addMissingTablesToDbString(
        sequelize: Sequelize,
        schema_tables: Array<any>,
        tables: modelInfoType[],
    ): Promise<{ upString: string; downString: string, addIndexesDownString:string[] }> {
        let upString: string = '';
        let downString: string = '';
        let orderToAdd: Array<string> = [];
        let referenced_tables: Array<string> = [];
        let drop_tables_down_string = '';
        let change_column_strings: {
            upString: string;
            downString: string;
        } = {upString: '', downString: ''};
        let index_strings:Array<{
            up_string: {
                add_index_string: string;
                remove_index_string: string;
            };
            down_string: {
                add_index_string: string;
                remove_index_string: string;
            };
        }> = []
        let remove_fk_strings:
            {up_string: {
                add_fk: string;
                remove_fk: string;
            };
            down_string: {
                add_fk: string;
                remove_fk: string;
            };
        } = {up_string: {add_fk: '', remove_fk: ''}, down_string: {add_fk: '', remove_fk: ''}};
        for(const table of tables) {
            let curr_model = this.modelService.getModelByTableName(sequelize, table.table_name, table.table_schema).getAttributes();
            for(const col in curr_model) {
                if(curr_model[col].references) {
                    let curr_ref = this.modelService.getModelReference(curr_model[col].references as {
                        model: string | {
                            tableName: string;
                            schema: string;
                        };
                        key: string;
                    });
                    referenced_tables.push(JSON.stringify({table_schema: curr_ref.model.schema, table_name: curr_ref.model.tableName}));
                }
            }
            orderToAdd.push(JSON.stringify({table_schema: table.table_schema, table_name: table.table_name}));
        }
        if(orderToAdd.length > 1)
            orderToAdd.sort(this.dbService.cmpTablesByRefInModel(sequelize, this.modelService));
        let addTablesStrings: { [x:string]: string } = {}
        for (const table of tables) {
            let removed_fk_obj = (await this.stringGeneratorService.getStringToDropFkBeforeChanging(table.table_name, table.table_schema, (
                await this.stringGeneratorService.getChangedColumns(sequelize, table.table_schema, table.table_name))));
            this.removed_fk = Object.assign(this.removed_fk, removed_fk_obj.removed_fk);

            remove_fk_strings.up_string.remove_fk += removed_fk_obj.res_up_string.remove_constr_string;
            remove_fk_strings.up_string.add_fk += removed_fk_obj.res_up_string.add_constr_string;  
            remove_fk_strings.down_string.remove_fk += removed_fk_obj.res_down_string.remove_constr_string;
            remove_fk_strings.down_string.add_fk += removed_fk_obj.res_down_string.add_constr_string;  
                   
            index_strings.push(await this.stringGeneratorService.getStringOfIndexes(table.table_schema, table.table_name, sequelize));
            if (!schema_tables.find((element) => element.table_name === table?.table_name && element.table_schema === table?.table_schema)) {
                let curr_model = this.modelService.getModelByTableName(
                    sequelize,
                    table?.table_name,
                    table?.table_schema,
                );
                addTablesStrings[JSON.stringify({table_schema: table.table_schema, table_name: table.table_name})] = this.stringGeneratorService.getUpStringToAddTable(
                    curr_model as ModelCtor<Model<any, any>> | undefined,
                    table?.table_schema,
                    table?.table_name,
                    table.table_schema
                );
                let is_cascade = false;
                    if(referenced_tables.includes(JSON.stringify({table_schema: table.table_schema, table_name: table.table_name}))) {
                        is_cascade = true;
                }
                drop_tables_down_string += this.stringGeneratorService.getUpStringToDeleteTable(
                    table?.table_schema,
                    table?.table_name,
                    is_cascade
                );
            } else {
                let tmp_change_str = await this.stringGeneratorService.getStringsToChangeTable(
                    sequelize,
                    table.table_schema,
                    table.table_name,
                    this.removed_fk
                );
                change_column_strings.upString += tmp_change_str.upString;
                change_column_strings.downString += tmp_change_str.downString;
                
            }
        }
        
        for(const tableToAdd of orderToAdd) {
            if(addTablesStrings[tableToAdd]) {
                upString += addTablesStrings[tableToAdd];
                //upString += this.stringGeneratorService.getStringOfIndexes(JSON.parse()) ///
            }
        }
        
        for(const index of index_strings) {
            upString += index.up_string.remove_index_string //deleting index
        }
        upString += remove_fk_strings.up_string.remove_fk; // removing fk before changing
        upString += change_column_strings.upString; //changing columns
        for(const index of index_strings) {
            upString += index.up_string.add_index_string //adding index
        } 
        upString += remove_fk_strings.up_string.add_fk; //adding fk after changing
        downString += remove_fk_strings.down_string.remove_fk; //removing fk
        downString += change_column_strings.downString;
        downString += remove_fk_strings.down_string.add_fk;
        for(const index of index_strings) {
            downString += index.down_string.remove_index_string; //deleting index down
        }     
        downString += drop_tables_down_string;
        let addIndexesDownString: Array<string> = [];
        for(const index of index_strings) {
            if(index.down_string.add_index_string!=='')
                addIndexesDownString.push(index.down_string.add_index_string);
        }
        return Promise.resolve({ upString, downString, addIndexesDownString });
    }

    async deleteMissingTablesFromDbString(
        sequelize: Sequelize,
        schema_tables: Array<any>,
        tables: modelInfoType[],
    ): Promise<{ upString: string; downString: string }> {
        let upString: string = '';
        let downString: string = '';
        let orderToAdd: Array<string> = [];
        let tables_for_cmp_funct: {[x:string]: TableToModel} = {};
        let referenced_tables: Array<string> = [];
        let addTablesStrings: { [x:string]: string } = {}
        for(const table of schema_tables) {
            if(table.table_name !== 'SequelizeMeta') {
                let curr_table_info = await this.dbService.tableToModelInfo(sequelize, table.table_schema, table.table_name);
                for(const col in curr_table_info) {
                    if(curr_table_info[col].references) {
                        referenced_tables.push(JSON.stringify({table_schema: curr_table_info[col].references.model.schema, table_name: curr_table_info[col].references.model.tableName}));
                    }
                }
                tables_for_cmp_funct[JSON.stringify({table_schema: table.table_schema, table_name: table.table_name})] = curr_table_info
                orderToAdd.push(JSON.stringify({table_schema: table.table_schema, table_name: table.table_name}));
            }
        }

        if(orderToAdd.length > 1) {
            orderToAdd.sort(this.dbService.compareTablesByReferencesInDb(tables_for_cmp_funct, this.modelService));
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
                    //upString
                    let is_cascade = false;
                    if(referenced_tables.includes(JSON.stringify({table_schema: schema_table.table_schema, table_name: schema_table.table_name}))) {
                        is_cascade = true;
                    }
                    upString += this.stringGeneratorService.getUpStringToDeleteTable(
                        schema_table.table_schema,
                        schema_table.table_name,
                        is_cascade
                    );
                    //downString
                    addTablesStrings[JSON.stringify({table_schema: schema_table.table_schema, table_name: schema_table.table_name})] = await this.stringGeneratorService.getDownStringToAddTable(
                        sequelize, schema_table.table_schema, schema_table.table_name
                    );
                    /*
                    downString += await this.stringGeneratorService.getDownStringToAddTable(
                        sequelize,
                        schema_table.table_schema,
                        schema_table.table_name,
                    );*/
                }
            }
        }
        for(const tableToAdd of orderToAdd) {
            if(addTablesStrings[tableToAdd]) {
                downString += addTablesStrings[tableToAdd];
            }
        }
    
        return Promise.resolve({ upString, downString });
    }
}