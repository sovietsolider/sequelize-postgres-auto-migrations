import { DataType } from 'sequelize-typescript';

export interface SchemaTableColumn {
    table_schema: string;
    table_name: string;
    column_name: string;
    data_type: string;
    character_maximum_length: any;
    column_default: any;
    is_nullable: any;
}

export interface SchemaTableColumnsConstraints {
    constraint_type: string;
    table_schema: string;
    constraint_name: string;
    table_name: string;
    column_name: string;
    foreign_table_schema: string;
    foreign_table_name: string;
    foreign_column_name: string;
}

export const sqlToSeqTypes = {
    bigint: DataType.BIGINT,
    boolean: DataType.BOOLEAN,
    character: DataType.CHAR,
    'character varying': DataType.STRING,
    cidr: DataType.CIDR,
    date: DataType.DATE,
    'double precision': DataType.DOUBLE,
    inet: DataType.INET,
    integer: DataType.INTEGER,
    json: DataType.JSON,
    jsonb: DataType.JSONB,
    macaddr: DataType.MACADDR,
    real: DataType.REAL,
    smallint: DataType.SMALLINT,
    text: DataType.TEXT,
    time: DataType.TIME,
    'timestamp with zone': DataType.DATE,
    'timestamp with time zone': DataType.DATE,
    'timestamp without time zone': DataType.DATE,
    bitea: DataType.BLOB,
    citext: DataType.CITEXT,
    uuid: DataType.UUIDV1,
};

export function getColumnsConstraintsSchemaInfo(
    table_schema: string,
    table_name: string,
) {
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
  ON ccu.constraint_name = tc.constraint_name \
  AND ccu.table_schema = tc.table_schema \
  AND ccu.ordinal_position = kcu.ordinal_position \
WHERE tc.table_name = '${table_name}' AND tc.table_schema = '${table_schema}';`;
}
