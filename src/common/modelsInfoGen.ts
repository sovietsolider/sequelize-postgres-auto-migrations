import { Model, Sequelize, col } from 'sequelize';
import { SchemaTableColumnWithoutConstr, SchemaTableColumnsConstraints, SchemaColumnType, SchemaColumns } from './interfaces';
import { getColumnsConstraintsSchemaInfo, getPgColumnsInfo } from './queryParsingFun';

export interface modelInfoType {
    table_name: string;
    table_schema: string;
}

export function generateModelsInfo(sequelize: Sequelize) {
    let res = [];
    let models = sequelize.modelManager.all;
    for (const m of models) {
        if (typeof m.getTableName() === typeof {}) {
            res.push({
                table_name: m.tableName,
                table_schema: (
                    m.getTableName() as unknown as {
                        tableName: string;
                        schema: string;
                        delimiter: string;
                    }
                ).schema,
            });
        } else {
            res.push({ table_name: m.tableName, table_schema: 'public' });
        }
    }
    return res;
}

export async function generateTableInfo(sequelize: Sequelize, table_schema: string, table_name: string): Promise<SchemaColumns> {
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
    const schema_table_columns_constraints: SchemaTableColumnsConstraints[] = (await sequelize.query(`${getColumnsConstraintsSchemaInfo(table_schema, table_name)}`)).at(0) as unknown as SchemaTableColumnsConstraints[];
    const pg_types: any = await sequelize.query(getPgColumnsInfo(table_schema, table_name));
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
            }
            else if(column.column_name === constraint.column_name) {
                res[column.column_name].constraint_type = constraint.constraint_type;
                res[column.column_name].foreign_table_name = null;
                res[column.column_name].foreign_column_name = null;
                res[column.column_name].foreign_table_schema = null;
            }
        }
    }
    return Promise.resolve(res);
}
