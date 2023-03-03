import { Sequelize, Model, ModelCtor } from 'sequelize-typescript';
import {  modelInfoType } from '../common/interfaces';
import { sqlToSeqTypes, SchemaTableColumnsConstraints, SchemaColumnType, SchemaColumns, SchemaTableColumnWithoutConstr } from '../common/interfaces';
import { StringsGeneratorService } from './stringsGenerator.service';
import { ModelService } from './model.service';

export class DbService {
    static addMissingTablesToDb(sequelize: Sequelize, schema_tables: Array<any>, tables: modelInfoType[]): { upString: string; downString: string } {
        let upString: string = '';
        let downString: string = '';
        for (const table of tables) {
            //console.log(schema_tables.indexOf(table));
            if (!schema_tables.find((element) => element.table_name === table?.table_name && element.table_schema === table?.table_schema)) {
                //console.log('ADDING');
                //console.log(table?.table_name);
                let curr_model = ModelService.getModelByTableName(sequelize, table?.table_name, table?.table_schema);
                upString += StringsGeneratorService.getUpStringToAddTable(curr_model as ModelCtor<Model<any, any>> | undefined, table?.table_schema, table?.table_name);
                downString += StringsGeneratorService.getUpStringToDeleteTable(table?.table_schema, table?.table_name);
            }
        }
        return { upString, downString };
    }

    static async deleteMissingTablesFromDb(sequelize: Sequelize, schema_tables: Array<any>, tables: modelInfoType[]): Promise<{ upString: string; downString: string }> {
        let upString: string = '';
        let downString: string = '';
        console.log(schema_tables);
        console.log(tables)
        for (const schema_table of schema_tables) {
            if (!tables.find((element) => element.table_name === schema_table.table_name && element.table_schema === schema_table.table_schema)) {
                console.log('DELETING');
                //upString
                upString += StringsGeneratorService.getUpStringToDeleteTable(schema_table.table_schema, schema_table.table_name);
                //downString
                downString += await StringsGeneratorService.getDownStringToAddTable(sequelize, schema_table.table_schema, schema_table.table_name);
            }
        }
        return Promise.resolve({ upString, downString });
    }

    static getPgColumnsInfo(table_schema: string, table_name: string): string {
        return `select att.attname, 
        att.attndims, 
        att.atttypmod,
        pg_catalog.format_type(atttypid, NULL) as display_type 
        from pg_attribute att 
        join pg_class tbl on tbl.oid = att.attrelid  
        join pg_namespace ns on tbl.relnamespace = ns.oid  
        where tbl.relname = '${table_name}'
        and ns.nspname = '${table_schema}'`
    }

    static async getForeignKeyOptions(sequelize: Sequelize, name: string, table_schema: string): Promise<
    {
        update_rule: string | null, 
        delete_rule: string | null
    }> {
        let options:any = (await sequelize.query(`select constraint_schema, constraint_name, update_rule, delete_rule from information_schema.referential_constraints WHERE constraint_schema='${table_schema}';`)).at(0);
        console.log(options);
        for(const val in options) {
            if(options[val].constraint_name === name)
                return Promise.resolve({ update_rule: options[val].update_rule, delete_rule: options[val].delete_rule })
        }
        return Promise.resolve({ update_rule: null, delete_rule: null});
    }

    static async generateTableInfo(sequelize: Sequelize, table_schema: string, table_name: string): Promise<SchemaColumns> {
        let res: SchemaColumns={};
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
                    and ns.nspname = '${table_schema}') a JOIN (SELECT table_schema, table_name, column_name, data_type, character_maximum_length, column_default, is_nullable, udt_name FROM information_schema.columns WHERE table_schema='${table_schema}' AND table_name='${table_name}') b ON b.column_name = a.attname;`
                        )) as unknown as []
        ).at(0) as unknown as SchemaTableColumnWithoutConstr[];
        //console.log("SCHEMA TABLE COLUMNS");
        //console.log(schema_table_columns)
        const schema_table_columns_constraints: SchemaTableColumnsConstraints[] = (await sequelize.query(`${this.getColumnsConstraintsSchemaInfo(table_schema, table_name)}`)).at(0) as unknown as SchemaTableColumnsConstraints[];
        const pg_types: any = await sequelize.query(DbService.getPgColumnsInfo(table_schema, table_name));
        for(const column of schema_table_columns) {
            //console.log(column)
            res[column.column_name] = { 
                table_schemas: column.table_schema, 
                table_name: column.table_name,
                column_name: column.column_name,
                column_type: column.data_type,
                pg_type: column.display_type,
                max_length: column.character_maximum_length,
                default_value: column.column_default,
                dimension: column.attndims,
                in_nullable: column.is_nullable,
                constraint_name: null,
                constraint_type: null,
                foreign_table_name: null,
                foreign_column_name: null,
                foreign_table_schema: null,
                pg_max_length: column.atttypmod
            }
            for(const constraint of schema_table_columns_constraints) {
                if(column.column_name === constraint.column_name && constraint.constraint_type === "FOREIGN KEY") {
                    res[column.column_name].constraint_type = constraint.constraint_type;
                    res[column.column_name].foreign_table_name = constraint.foreign_table_name;
                    res[column.column_name].foreign_column_name = constraint.foreign_column_name;
                    res[column.column_name].foreign_table_schema = constraint.foreign_table_schema;
                    res[column.column_name].constraint_name = constraint.constraint_name
                }
                else if(column.column_name === constraint.column_name) {
                    res[column.column_name].constraint_type = constraint.constraint_type;
                    res[column.column_name].foreign_table_name = null;
                    res[column.column_name].foreign_column_name = null;
                    res[column.column_name].foreign_table_schema = null;
                    res[column.column_name].constraint_name = null;
                }
            }
        }
        return Promise.resolve(res);
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
}