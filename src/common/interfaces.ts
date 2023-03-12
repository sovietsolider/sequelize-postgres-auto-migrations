import { DataType } from 'sequelize-typescript';

export interface SchemaTableColumnWithoutConstr {
    table_schema: string;
    table_name: string;
    column_name: string;
    data_type: string;
    character_maximum_length: string | null;
    column_default: null|string;
    is_nullable: string;
    attndims: number;
    display_type: string;
    atttypmod: number;
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

export interface SchemaColumnType {
    [index: string]: any;
    table_schemas: string;
    table_name: string;
    column_name: string;
    column_type: string;
    max_length: string|null;
    default_value: any;
    dimension: number;
    is_nullable: string;
    pg_type: string;
    pg_max_length: number;
    constraint_type: string|undefined;
    foreign_table_name: string|undefined;
    foreign_column_name: string|undefined;
    foreign_table_schema: string|undefined;
    constraint_name: string|undefined;
}

export interface SchemaColumns {
    [key: string]: SchemaColumnType;
}

interface sqlToSeqTypesInterface {
    [key: string]: string;
    bigint: string;
    boolean: string;
    character: string;
    'character varying': string;
    cidr: string;
    date: string;
    'double precision': string;
    inet: string;
    integer: string;
    json: string;
    jsonb: string;
    macaddr: string;
    real: string;
    smallint: string;
    text: string;
    time: string;
    'timestamp with zone': string;
    'timestamp with time zone': string;
    'timestamp without time zone': string;
    bitea: string;
    citext: string;
    uuid: string;
}
export const sqlToSeqTypes: sqlToSeqTypesInterface = {
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

export interface TableToModel {
    [key: string]: ModelAttribute;
}

export interface ModelAttribute {
    type?: string;
    autoIncrement?: boolean;
    defaultValue?: string | null;
    allowNull?: boolean;
    primaryKey?: boolean;
    reference?: any;
    onUpdate?: string | null;
    onDelete?: string | null;
    //noDimensionType?: string
}

export interface modelInfoType {
    table_name: string;
    table_schema: string;
}

export interface comparisonOptions {
    enableCascadeDeleting: boolean,
    replaceTableWhenAttributesMatch: boolean
}
