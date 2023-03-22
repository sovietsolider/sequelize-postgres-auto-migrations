import { Sequelize, Model, ModelCtor,  } from 'sequelize-typescript';
import { modelInfoType, TableToModel } from '../common/interfaces';
import { ModelAttributeColumnReferencesOptions } from "sequelize"
import {
    sqlToSeqTypes,
    SchemaTableColumnsConstraints,
    SchemaColumnType,
    SchemaColumns,
    SchemaTableColumnWithoutConstr,
} from '../common/interfaces';
import { StringsGeneratorService } from './stringsGenerator.service';
import { ModelService } from './model.service';
import { sequelize } from '../main';
const pg_magic_round = 4;

export class DbService {
    static async addMissingTablesToDb(
        sequelize: Sequelize,
        schema_tables: Array<any>,
        tables: modelInfoType[],
    ): Promise<{ upString: string; downString: string }> {
        let upString: string = '';
        let downString: string = '';
        let orderToAdd: Array<string> = [];
        console.log(schema_tables)
        for(const table of tables) {
            orderToAdd.push(JSON.stringify({table_schema: table.table_schema, table_name: table.table_name}));
        }
        if(orderToAdd.length > 1)
            orderToAdd.sort(this.compareTablesByReferencesInModel);
        console.log("SORTED ADDING")
        console.log(orderToAdd);
        let addTablesStrings: { [x:string]: string } = {}
        for (const table of tables) {
            if (!schema_tables.find((element) => element.table_name === table?.table_name && element.table_schema === table?.table_schema)) {
                let curr_model = ModelService.getModelByTableName(
                    sequelize,
                    table?.table_name,
                    table?.table_schema,
                );
                addTablesStrings[JSON.stringify({table_schema: table.table_schema, table_name: table.table_name})] = StringsGeneratorService.getUpStringToAddTable(
                    curr_model as ModelCtor<Model<any, any>> | undefined,
                    table?.table_schema,
                    table?.table_name,
                    table.table_schema
                );
                downString += StringsGeneratorService.getUpStringToDeleteTable(
                    table?.table_schema,
                    table?.table_name,
                );
            } else {
                let change_column_strings = await StringsGeneratorService.getStringsToChangeTable(
                    sequelize,
                    table.table_schema,
                    table.table_name,
                );
                upString += change_column_strings.upString;
                downString += change_column_strings.downString;
            }
        }
        for(const tableToAdd of orderToAdd) {
            upString += addTablesStrings[tableToAdd];
        }
        return Promise.resolve({ upString, downString });
    }

    private static compareTablesByReferencesInModel(table1_name_str: string, table2_name_str: string) {
        let table1_name: {table_schema:string, table_name: string} = JSON.parse(table1_name_str);
        let table2_name: {table_schema:string, table_name: string} = JSON.parse(table2_name_str);
        let table1 = ModelService.getModelByTableName(sequelize, table1_name.table_name, table1_name.table_schema);
        let table2 = ModelService.getModelByTableName(sequelize, table2_name.table_name, table2_name.table_schema);
        let table1_attrs = table1.getAttributes();
        let table2_attrs = table2.getAttributes();
        for(const attr1 in table1_attrs) {
            if(table1_attrs[attr1].references) {
                let attr1_references = StringsGeneratorService.getModelReference(table1_attrs[attr1].references as {model: { tableName: string; schema: string } | string;key: string;});
                if(table1_attrs[attr1].references && (attr1_references.model.tableName === table2_name.table_name
                    && attr1_references.model.schema === table2_name.table_schema))
                        return 1;
            }
        }
        for(const attr2 in table2_attrs) {
            if(table2_attrs[attr2].references) {
                let attr2_references = StringsGeneratorService.getModelReference(table2_attrs[attr2].references as {model: { tableName: string; schema: string } | string;key: string;});
                if((attr2_references.model.tableName === table1_name.table_name
                    && attr2_references.model.schema === table1_name.table_schema))
                        return -1;
            }
            
        }
        return 0;
    }

    private static compareTablesByReferencesInDb(tables_for_cmp_func: {[x:string]: TableToModel}) {
        return function(table1_name_str: string, table2_name_str: string) {
            let table1_name: {table_schema:string, table_name: string} = JSON.parse(table1_name_str);
            let table2_name: {table_schema:string, table_name: string} = JSON.parse(table2_name_str);
            let table1_attrs = tables_for_cmp_func[table1_name_str];
            let table2_attrs = tables_for_cmp_func[table2_name_str];
            for(const attr1 in table1_attrs) {
                if(table1_attrs[attr1].references) {
                    let attr1_references = StringsGeneratorService.getModelReference(table1_attrs[attr1].references as {model: { tableName: string; schema: string } | string;key: string;});
                    if(table1_attrs[attr1].references && (attr1_references.model.tableName === table2_name.table_name
                        && attr1_references.model.schema === table2_name.table_schema))
                            return -1;
                }
            }
            for(const attr2 in table2_attrs) {
                if(table2_attrs[attr2].references) {
                    let attr2_references = StringsGeneratorService.getModelReference(table2_attrs[attr2].references as {model: { tableName: string; schema: string } | string;key: string;});
                    if((attr2_references.model.tableName === table1_name.table_name
                        && attr2_references.model.schema === table1_name.table_schema))
                            return 1;
                }
                
            }
            return 0;
        }
    }    

    static async deleteMissingTablesFromDb(
        sequelize: Sequelize,
        schema_tables: Array<any>,
        tables: modelInfoType[],
    ): Promise<{ upString: string; downString: string }> {
        let upString: string = '';
        let downString: string = '';
        let orderToDelete: Array<string> = [];
        let tables_for_cmp_funct: {[x:string]: TableToModel} = {};
        for(const table of schema_tables) {
            if(table.table_name !== 'SequelizeMeta') {
                tables_for_cmp_funct[JSON.stringify({table_schema: table.table_schema, table_name: table.table_name})] = await this.tableToModelInfo(sequelize, table.table_schema, table.table_name);
                orderToDelete.push(JSON.stringify({table_schema: table.table_schema, table_name: table.table_name}));
            }
        }
        if(orderToDelete.length > 1) {
            orderToDelete.sort(this.compareTablesByReferencesInDb(tables_for_cmp_funct));
        }
        console.log("SORTED DELETING")
        console.log(orderToDelete)
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
                    upString += StringsGeneratorService.getUpStringToDeleteTable(
                        schema_table.table_schema,
                        schema_table.table_name,
                    );
                    //downString
                    downString += await StringsGeneratorService.getDownStringToAddTable(
                        sequelize,
                        schema_table.table_schema,
                        schema_table.table_name,
                    );
                }
            }
        }
        return Promise.resolve({ upString, downString });
    }

    private static getPgColumnsInfo(table_schema: string, table_name: string): string {
        return `select att.attname, 
        att.attndims, 
        att.atttypmod,
        pg_catalog.format_type(atttypid, NULL) as display_type 
        from pg_attribute att 
        join pg_class tbl on tbl.oid = att.attrelid  
        join pg_namespace ns on tbl.relnamespace = ns.oid  
        where tbl.relname = '${table_name}'
        and ns.nspname = '${table_schema}'`;
    }

    private static async getForeignKeyOptions(
        sequelize: Sequelize,
        name: string,
        table_schema: string,
    ): Promise<{
        update_rule: string | null;
        delete_rule: string | null;
    }> {
        let options: any = (
            await sequelize.query(
                `select constraint_schema, constraint_name, update_rule, delete_rule from information_schema.referential_constraints WHERE constraint_schema='${table_schema}';`,
            )
        ).at(0);
        for (const val in options) {
            if (options[val].constraint_name === name)
                return Promise.resolve({
                    update_rule: options[val].update_rule,
                    delete_rule: options[val].delete_rule,
                });
        }
        return Promise.resolve({ update_rule: null, delete_rule: null });
    }

    private static async generateTableInfo(
        sequelize: Sequelize,
        table_schema: string,
        table_name: string,
    ): Promise<SchemaColumns> {
        let res: SchemaColumns = {};
        const schema_table_columns: SchemaTableColumnWithoutConstr[] = (
            (await sequelize.query(`
                select * from (select att.attname, 
                    att.attndims, 
                    att.atttypmod,
                    pg_catalog.format_type(atttypid, NULL) as display_type 
                    from pg_attribute att 
                    join pg_class tbl on tbl.oid = att.attrelid  
                    join pg_namespace ns on tbl.relnamespace = ns.oid  
                    where tbl.relname = '${table_name}'
                    and ns.nspname = '${table_schema}') a JOIN (SELECT table_schema, table_name, column_name, data_type, character_maximum_length, column_default, is_nullable, udt_name FROM information_schema.columns WHERE table_schema='${table_schema}' AND table_name='${table_name}') b ON b.column_name = a.attname;`)) as unknown as []
        ).at(0) as unknown as SchemaTableColumnWithoutConstr[];
        const schema_table_columns_constraints: SchemaTableColumnsConstraints[] = (
            await sequelize.query(
                `${this.getColumnsConstraintsSchemaInfo(table_schema, table_name)}`,
            )
        ).at(0) as unknown as SchemaTableColumnsConstraints[];
        console.log(schema_table_columns_constraints);
        const pg_types: any = await sequelize.query(
            DbService.getPgColumnsInfo(table_schema, table_name),
        );
        for (const column of schema_table_columns) {
            res[column.column_name] = {
                table_schemas: column.table_schema,
                table_name: column.table_name,
                column_name: column.column_name,
                column_type: column.data_type,
                pg_type: column.display_type,
                max_length: column.character_maximum_length,
                default_value: column.column_default,
                dimension: column.attndims,
                is_nullable: column.is_nullable,
                fk_constraint_name: undefined,
                pk_constraint_name: undefined,
                unique_constraint_name: undefined,
                foreign_key: undefined,
                foreign_table_name: undefined,
                foreign_column_name: undefined,
                foreign_table_schema: undefined,
                pg_max_length: column.atttypmod,
                primary_key: undefined,
                unique: undefined,
            };
            for (const constraint of schema_table_columns_constraints) {
                if (
                    column.column_name === constraint.column_name &&
                    constraint.constraint_type === 'FOREIGN KEY'
                ) {
                    res[column.column_name].foreign_key = true;
                    res[column.column_name].foreign_table_name = constraint.foreign_table_name;
                    res[column.column_name].foreign_column_name = constraint.foreign_column_name;
                    res[column.column_name].foreign_table_schema = constraint.foreign_table_schema;
                    res[column.column_name].fk_constraint_name = constraint.constraint_name;
                }
                if (
                    column.column_name === constraint.column_name &&
                    constraint.constraint_type === 'PRIMARY KEY'
                ) {
                    res[column.column_name].primary_key = true;
                    res[column.column_name].pk_constraint_name = constraint.constraint_name;
                }
                if (
                    column.column_name === constraint.column_name &&
                    constraint.constraint_type === 'UNIQUE'
                ) {
                    res[column.column_name].unique = true;
                    res[column.column_name].unique_constraint_name = constraint.constraint_name;
                }
            }
        }
        return Promise.resolve(res);
    }

    static async tableToModelInfo(sequelize: Sequelize, table_schema: string, table_name: string) {
        let table_info: SchemaColumns = await this.generateTableInfo(
            sequelize,
            table_schema,
            table_name,
        );
        let res: TableToModel = {};
        for (const column in table_info) {
            res[column] = {};
            if (table_info[column].pg_type.match(/\"enum_\.*/)) {
                //ENUM TYPE
                let type_string = '';
                type_string += `Sequelize.ENUM(`;
                let enum_values: { enum_range: Array<string> } = (
                    (
                        await sequelize.query(
                            `SELECT enum_range(NULL::${table_info[column].pg_type});`,
                        )
                    ).at(0) as Array<any>
                ).at(0);
                for (const val of enum_values.enum_range) type_string += `'${val}',`;
                type_string += ')';
                res[column].type = type_string;
            } else if (table_info[column].column_type === 'ARRAY') {
                //ARRAY TYPE
                let type_string = '';
                let final_array_type: string = table_info[column].pg_type.replace(
                    '[]',
                    '',
                ) as string;
                //res[column].noDimensionType = sqlToSeqTypes[final_array_type];
                for (let i = 0; i < table_info[column].dimension; i++)
                    type_string += `Sequelize.ARRAY(`;

                if (sqlToSeqTypes[final_array_type] === 'Sequelize.STRING')
                    type_string += `Sequelize.STRING(${
                        table_info[column].pg_max_length - pg_magic_round
                    })`;
                else type_string += `${sqlToSeqTypes[final_array_type]}`;
                for (let i = 0; i < table_info[column].dimension; i++) {
                    type_string += ')';
                }
                res[column].type = type_string;
            } else if (table_info[column].column_type === 'character varying')
                res[column].type = `Sequelize.STRING(${table_info[column].max_length})`;
            else res[column].type = `${sqlToSeqTypes[table_info[column].column_type]}`;
            if (
                table_info[column].default_value &&
                table_info[column].default_value.match(/\bnextval.*/)
            ) {
                res[column].autoIncrement = true;
            } else if (table_info[column].default_value !== null)
                res[column].defaultValue = this.parseDefaultValue(table_info[column]);
            else res[column].defaultValue = undefined;
            if (table_info[column].is_nullable === 'YES') {
                res[column].allowNull = true;
            } else res[column].allowNull = false;
            if (table_info[column].primary_key === true) {
                //CONSTRAINTS
                res[column].primaryKey = true;
                res[column].pk_name = table_info[column].pk_constraint_name;
            }
            if (table_info[column].foreign_key === true) {
                res[column].foreignKey = true;
                res[column].fk_name = table_info[column].fk_constraint_name;
                res[column].references = {
                    model: {
                        tableName: table_info[column].foreign_table_name,
                        schema: table_info[column].foreign_table_schema,
                    },
                    key: table_info[column].foreign_column_name,
                };
                let fk_options = await DbService.getForeignKeyOptions(
                    sequelize,
                    table_info[column].fk_constraint_name as string,
                    table_info[column].table_schemas,
                );
                res[column].onUpdate = fk_options.update_rule;
                res[column].onDelete = fk_options.delete_rule;
            }
            if (table_info[column].unique === true) {
                res[column].unique = true;
                res[column].unique_name = table_info[column].unique_constraint_name;
            }
        }
        return Promise.resolve(res);
    }

    static parseDefaultValue(column_info: SchemaColumnType) {
        let default_value = column_info.default_value as string;
        default_value = default_value.replace(/ARRAY/g, '');
        default_value = default_value.replace(/::character varying\([^)]*\)/g, '');
        default_value = default_value.replace(/::character varying/g, '');
        return default_value;
    }

    static getColumnsConstraintsSchemaInfo(table_schema: string, table_name: string) {
        return `SELECT \
            tc.constraint_type, \
            tc.table_schema, \
            tc.constraint_name, \
            tc.table_name, \
            kcu.column_name, \
            ccu.table_schema AS foreign_table_schema, \
            ccu.table_name AS foreign_table_name, \
            ccu.column_name AS foreign_column_name \
        FROM \
            information_schema.table_constraints AS tc \
        JOIN information_schema.key_column_usage AS kcu \
        ON tc.constraint_name = kcu.constraint_name \
        AND tc.table_schema = kcu.table_schema \
        JOIN (select row_number() over (partition by table_schema, table_name, constraint_name order by row_num) ordinal_position, \
                 table_schema, table_name, column_name, constraint_name \
        from   (select row_number() over (order by 1) row_num, table_schema, table_name, column_name, constraint_name \
                  from   information_schema.constraint_column_usage \
                 ) t \
         ) AS ccu \
        on ccu.constraint_name = tc.constraint_name \
         and ccu.table_schema = tc.table_schema \
        and ccu.ordinal_position = kcu.ordinal_position \
        where tc.table_name = '${table_name}' AND tc.table_schema = '${table_schema}';`;
    }

    static async getTableIndexes(table_schema: string, table_name: string) {
        let res = await sequelize.query(`SELECT tablename as tableName, indexname as indexName,indexdef as indexDef FROM pg_indexes WHERE schemaname = '${table_schema}' AND tablename = '${table_name}' ORDER BY tablename, indexname;`);
        return Promise.resolve(res);
    }
}
