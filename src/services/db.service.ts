import { Sequelize, Model, ModelCtor } from 'sequelize-typescript';
import { MigrationOptions, modelInfoType, TableToModel } from '../common/interfaces';
import { ModelAttributeColumnReferencesOptions } from 'sequelize';
import {
    sqlToSeqTypes,
    SchemaTableColumnsConstraints,
    SchemaColumnType,
    SchemaColumns,
    SchemaTableColumnWithoutConstr,
} from '../common/interfaces';
import { StringsGeneratorService } from './stringsGenerator.service';
import { ModelService } from './model.service';
import { FileService } from './file.service';
const pg_magic_round = 4;

export class DbService {
    sequelize: Sequelize;
    migration_options: MigrationOptions | undefined;
    modelService: ModelService;
    constructor(_sequelize: Sequelize, modelService: ModelService) {
        this.sequelize = _sequelize;
        this.modelService = modelService;
    }

    cmpTablesByRefInModel(sequelize: Sequelize, modelService: ModelService) {
        return function compareTablesByReferencesInModel(
            table1_name_str: string,
            table2_name_str: string,
        ) {
            let table1_name: { table_schema: string; table_name: string } =
                JSON.parse(table1_name_str);
            let table2_name: { table_schema: string; table_name: string } =
                JSON.parse(table2_name_str);
            //console.log(table1_name_str, table2_name_str)
            let table1 = modelService.getModelByTableName(
                sequelize,
                table1_name.table_name,
                table1_name.table_schema,
            );
            let table2 = modelService.getModelByTableName(
                sequelize,
                table2_name.table_name,
                table2_name.table_schema,
            );
            let table1_attrs = table1.getAttributes();
            let table2_attrs = table2.getAttributes();
            for (const attr1 in table1_attrs) {
                if (table1_attrs[attr1].references) {
                    let attr1_references = modelService.getModelReference(
                        table1_attrs[attr1].references as {
                            model: { tableName: string; schema: string } | string;
                            key: string;
                        },
                    );
                    if (
                        table1_attrs[attr1].references &&
                        attr1_references.model.tableName === table2_name.table_name &&
                        attr1_references.model.schema === table2_name.table_schema
                    )
                        return 1;
                }
            }
            for (const attr2 in table2_attrs) {
                if (table2_attrs[attr2].references) {
                    let attr2_references = modelService.getModelReference(
                        table2_attrs[attr2].references as {
                            model: { tableName: string; schema: string } | string;
                            key: string;
                        },
                    );
                    if (
                        attr2_references.model.tableName === table1_name.table_name &&
                        attr2_references.model.schema === table1_name.table_schema
                    )
                        return -1;
                }
            }
            return 0;
        };
    }

    compareTablesByReferencesInDb(
        tables_for_cmp_func: { [x: string]: TableToModel },
        modelService: ModelService,
    ) {
        return function (table1_name_str: string, table2_name_str: string) {
            let table1_name: { table_schema: string; table_name: string } =
                JSON.parse(table1_name_str);
            let table2_name: { table_schema: string; table_name: string } =
                JSON.parse(table2_name_str);
            let table1_attrs = tables_for_cmp_func[table1_name_str];
            let table2_attrs = tables_for_cmp_func[table2_name_str];
            for (const attr1 in table1_attrs) {
                if (table1_attrs[attr1].references) {
                    let attr1_references = modelService.getModelReference(
                        table1_attrs[attr1].references as {
                            model: { tableName: string; schema: string } | string;
                            key: string;
                        },
                    );
                    if (
                        table1_attrs[attr1].references &&
                        attr1_references.model.tableName === table2_name.table_name &&
                        attr1_references.model.schema === table2_name.table_schema
                    )
                        return 1;
                }
            }
            for (const attr2 in table2_attrs) {
                if (table2_attrs[attr2].references) {
                    let attr2_references = modelService.getModelReference(
                        table2_attrs[attr2].references as {
                            model: { tableName: string; schema: string } | string;
                            key: string;
                        },
                    );
                    if (
                        attr2_references.model.tableName === table1_name.table_name &&
                        attr2_references.model.schema === table1_name.table_schema
                    )
                        return -1;
                }
            }
            return 0;
        };
    }

    private getPgColumnsInfo(table_schema: string, table_name: string): string {
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

    private async getForeignKeyOptions(
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

    private async generateTableInfo(
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
        //console.log(table_name)
        //console.log(schema_table_columns_constraints);
        //console.log('/////')
        const pg_types: any = await sequelize.query(
            this.getPgColumnsInfo(table_schema, table_name),
        );
        //console.log(await this.getTableExists(table_schema, table_name, sequelize));
        let schema_table_columns_comments: {
            column_name: string;
            col_description: string;
        }[] = [];
        if(await this.getTableExists(table_schema, table_name, sequelize))
            schema_table_columns_comments = await this.getTableColumnsComments(table_schema, table_name, sequelize);
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
                comment: undefined
            };
            for (const constraint of schema_table_columns_constraints) {
                if (
                    column.column_name === constraint.column_name && column.table_name === table_name && column.table_schema === table_schema &&
                    constraint.constraint_type === 'FOREIGN KEY'
                ) {
                    res[column.column_name].foreign_key = true;
                    res[column.column_name].foreign_table_name = constraint.foreign_table_name;
                    res[column.column_name].foreign_column_name = constraint.foreign_column_name;
                    res[column.column_name].foreign_table_schema = constraint.foreign_table_schema;
                    res[column.column_name].fk_constraint_name = constraint.constraint_name;
                }
                if (
                    column.column_name === constraint.column_name && column.table_name === table_name && column.table_schema === table_schema &&
                    column.column_name === constraint.column_name &&
                    constraint.constraint_type === 'PRIMARY KEY'
                ) {
                    res[column.column_name].primary_key = true;
                    res[column.column_name].pk_constraint_name = constraint.constraint_name;
                }
                if (
                    column.column_name === constraint.column_name && column.table_name === table_name && column.table_schema === table_schema &&
                    column.column_name === constraint.column_name &&
                    constraint.constraint_type === 'UNIQUE'
                ) {
                    res[column.column_name].unique = true;
                    res[column.column_name].unique_constraint_name = constraint.constraint_name;
                }
            }
            for(const col of schema_table_columns_comments) {
                if(col.column_name === column.column_name && col.col_description !== null) {
                        res[column.column_name].comment = col.col_description; 
                }
                
            }
        }
        return Promise.resolve(res);
    }

    async getRawType(sequelize: Sequelize, table_schema: string, table_name: string, column_name: string) {
        let table_info: SchemaColumns = await this.generateTableInfo(
            sequelize,
            table_schema,
            table_name,
        );
        return Promise.resolve(table_info[column_name].pg_type);
    }

    async tableToModelInfo(sequelize: Sequelize, table_schema: string, table_name: string, options: { enum_values: string[], column_name: string} = {enum_values: [], column_name: ''}) {
        let table_info: SchemaColumns = await this.generateTableInfo(
            sequelize,
            table_schema,
            table_name,
        );
        let res: TableToModel = {};
        for (const column in table_info) {
            res[column] = {};
            if (
                table_info[column].pg_type.match(/\"enum_\.*/) &&
                table_info[column].column_type !== 'ARRAY'
            ) {
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

                if (sqlToSeqTypes[final_array_type] === 'Sequelize.STRING') {
                    type_string += `Sequelize.STRING(${
                        table_info[column].pg_max_length - pg_magic_round
                    })`;
                } else if (final_array_type.match(/\"enum_\.*/)) {
                    let enum_values: { enum_range: Array<string> } = (
                        (
                            await sequelize.query(
                                `SELECT enum_range(NULL::${table_info[column].pg_type.replace(
                                    '[]',
                                    '',
                                )});`,
                            )
                        ).at(0) as Array<any>
                    ).at(0);
                    
                    type_string += 'Sequelize.ENUM(';
                    for (const val of enum_values.enum_range) {
                        type_string += `'${val}',`;
                        if(column === options.column_name) {
                            options.enum_values.push(val);
                            //console.log(options.enum_values)
                        }
                    }
                    type_string += ')';
                } else type_string += `${sqlToSeqTypes[final_array_type]}`;
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
                let fk_options = await this.getForeignKeyOptions(
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
            res[column].comment = table_info[column].comment;
        }
        return Promise.resolve(res);
    }

    private parseDefaultValue(column_info: SchemaColumnType) {
        let default_value = column_info.default_value as string;
        default_value = default_value.replace(/ARRAY/g, '');
        default_value = default_value.replace(/::character varying\([^)]*\)/g, '');
        default_value = default_value.replace(/::character varying/g, '');
        default_value = default_value.replace(/::"enum.*\".*/, '');
        return default_value;
    }

    getColumnsConstraintsSchemaInfo(table_schema: string, table_name: string) {
        return `SELECT tc.constraint_name,
        tc.constraint_type,
        tc.table_name,
        tc.table_schema,
        kcu.column_name,
        tc.is_deferrable,
        tc.initially_deferred,
        rc.match_option AS match_type,
        
        rc.update_rule AS on_update,
        rc.delete_rule AS on_delete,
        ccu.table_name AS foreign_table_name,
        ccu.table_schema as foreign_table_schema,
        ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        
        LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_catalog = kcu.constraint_catalog
        AND tc.constraint_schema = kcu.constraint_schema
        AND tc.constraint_name = kcu.constraint_name
        
        LEFT JOIN information_schema.referential_constraints rc
        ON tc.constraint_catalog = rc.constraint_catalog
        AND tc.constraint_schema = rc.constraint_schema
        AND tc.constraint_name = rc.constraint_name
        
        LEFT JOIN information_schema.constraint_column_usage ccu
        ON rc.unique_constraint_catalog = ccu.constraint_catalog
        AND rc.unique_constraint_schema = ccu.constraint_schema
        AND rc.unique_constraint_name = ccu.constraint_name
        WHERE tc.table_name = '${table_name}' AND tc.table_schema='${table_schema}';`;
    }

    async getTableIndexes(table_schema: string, table_name: string, sequelize: Sequelize) {
        let res = await sequelize.query(
            `SELECT tablename as "tableName", indexname as "indexName",indexdef as "indexDef" FROM pg_indexes WHERE schemaname = '${table_schema}' AND tablename = '${table_name}' ORDER BY tablename, indexname;`,
        );
        return Promise.resolve(res);
    }

    async getTableColumnsComments(table_schema: string, table_name: string, sequelize: Sequelize) {
        let res = await sequelize.query(
            `select column_name, col_description('"${table_schema}"."${table_name}"'::regclass, ordinal_position)
            from information_schema.columns
            where table_schema = '${table_schema}' and table_name = '${table_name}';`
        );
        return Promise.resolve(res.at(0) as {column_name: string, col_description: string}[]);
    }

    async getTableExists(table_schema: string, table_name: string, sequelize: Sequelize) {
        let res = await sequelize.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE  table_schema = '${table_schema}'
                AND    table_name   = '${table_name}');`
        );
        return Promise.resolve((res.at(0) as {exists: boolean}[]).at(0)?.exists as boolean);
    }
}
