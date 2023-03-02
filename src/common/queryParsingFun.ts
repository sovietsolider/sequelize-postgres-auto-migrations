import { Sequelize, Model, ModelCtor } from 'sequelize-typescript';
import { ModelAttributeColumnOptions } from 'sequelize';

export function getTypeByModelAttr(current_type: any, res_string = '') {
    let type_name = current_type.constructor.name; //(description[attr].type as unknown as {option: any, type: string}).type.constructor.name
    if (type_name === 'STRING') {
        let type_length = current_type._length;

        res_string += `DataType.STRING(${type_length})`;
    } else if (type_name !== 'ARRAY' && type_name !== 'ENUM') res_string += `DataType.${type_name}`;
    else if (type_name === 'ARRAY') {
        res_string += `DataType.ARRAY(${getTypeByModelAttr(current_type.type, res_string)})`;
    } else if (type_name === 'ENUM') {
        //console.log(current_type.values)
        res_string += `DataType.ENUM(`;
        for (const [i, element] of current_type.values.entries()) {
            if (i === current_type.values.length - 1) {
                res_string += `'${element}')`;
                continue;
            }
            res_string += `'${element}',`;
        }
    }
    return res_string;
}

export function getColumnsConstraintsSchemaInfo(table_schema: string, table_name: string) {
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

export function getPgColumnsInfo(table_schema: string, table_name: string): string {
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