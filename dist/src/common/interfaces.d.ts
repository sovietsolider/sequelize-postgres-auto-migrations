export interface SchemaTableColumnWithoutConstr {
    table_schema: string;
    table_name: string;
    column_name: string;
    data_type: string;
    character_maximum_length: string | null;
    column_default: null | string;
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
    table_schemas: string;
    table_name: string;
    column_name: string;
    column_type: string;
    max_length: string | null;
    default_value: any;
    dimension: number;
    is_nullable: string;
    pg_type: string;
    pg_max_length: number;
    fk_constraint_name: string | undefined;
    pk_constraint_name: string | undefined;
    unique_constraint_name: string | undefined;
    foreign_key: boolean | undefined;
    foreign_table_name: string | undefined;
    foreign_column_name: string | undefined;
    foreign_table_schema: string | undefined;
    primary_key: boolean | undefined;
    unique: boolean | undefined;
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
    bytea: string;
    citext: string;
    uuid: string;
    numeric: string;
}
export declare const sqlToSeqTypes: sqlToSeqTypesInterface;
export interface TableToModel {
    [key: string]: ModelAttribute;
}
export interface ModelAttribute {
    type?: string;
    autoIncrement?: boolean;
    defaultValue?: string | null;
    allowNull?: boolean;
    primaryKey?: boolean;
    references?: any;
    onUpdate?: string | null;
    onDelete?: string | null;
    unique?: boolean;
    foreignKey?: boolean;
    pk_name?: string;
    fk_name?: string;
    unique_name?: string;
}
export interface modelInfoType {
    table_name: string;
    table_schema: string;
}
export interface comparisonOptions {
    enableCascadeDeleting: boolean;
    replaceTableWhenAttributesMatch: boolean;
}
export interface MigrationOptions {
    dropTableOnDelete: string | undefined;
}
export {};
