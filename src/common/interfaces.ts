import { DataType } from 'sequelize-typescript';

export interface SchemaTableColumnWithoutConstr {
    table_schema: string;
    table_name: string;
    column_name: string;
    data_type: string;
    character_maximum_length: any;
    column_default: any;
    is_nullable: any,
    attndims: any,
    display_type: any,
    atttypmod: any
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

export interface SchemaColumnType{
    [index: string]: any,
    table_schemas: any, 
    table_name: any,
    column_name: any,
    column_type: any,
    max_length: any,
    default_value: any,
    dimension: any,
    in_nullable: any,
    pg_type: any,
    pg_max_length: any,
    constraint_type: any,
    foreign_table_name: any,
    foreign_column_name: any,
    foreign_table_schema: any
}

export interface SchemaColumns {
    [key: string]: SchemaColumnType
}

interface sqlToSeqTypesInterface {
    [key: string]: string,
    bigint: string,
    boolean: string,
    character: string,
    'character varying': string,
    cidr: string,
    date: string,
    'double precision': string,
    inet: string,
    integer: string,
    json: string,
    jsonb: string,
    macaddr: string,
    real: string,
    smallint: string,
    text: string,
    time: string,
    'timestamp with zone': string,
    'timestamp with time zone': string,
    'timestamp without time zone': string
    bitea: string,
    citext: string,
    uuid: string,
}
export const sqlToSeqTypes:sqlToSeqTypesInterface = {
    bigint: 'DataType.BIGINT',
    boolean: 'DataType.BOOLEAN',
    character: 'DataType.CHAR',
    'character varying': 'DataType.STRING',
    cidr: 'DataType.CIDR',
    date: 'DataType.DATE',
    'double precision': 'DataType.DOUBLE',
    inet: 'DataType.INET',
    integer: 'DataType.INTEGER',
    json: 'DataType.JSON',
    jsonb: 'DataType.JSONB',
    macaddr: 'DataType.MACADDR',
    real: 'DataType.REAL',
    smallint: 'DataType.SMALLINT',
    text: 'DataType.TEXT',
    time: 'DataType.TIME',
    'timestamp with zone': 'DataType.DATE',
    'timestamp with time zone': 'DataType.DATE',
    'timestamp without time zone': 'DataType.DATE',
    bitea: 'DataType.BLOB',
    citext: 'DataType.CITEXT',
    uuid: 'DataType.UUIDV1',
};

