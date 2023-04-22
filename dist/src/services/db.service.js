"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbService = void 0;
const interfaces_1 = require("../common/interfaces");
const pg_magic_round = 4;
class DbService {
    constructor(_sequelize, modelService) {
        this.sequelize = _sequelize;
        this.modelService = modelService;
    }
    cmpTablesByRefInModel(sequelize, modelService) {
        return function compareTablesByReferencesInModel(table1_name_str, table2_name_str) {
            let table1_name = JSON.parse(table1_name_str);
            let table2_name = JSON.parse(table2_name_str);
            //console.log(table1_name_str, table2_name_str)
            let table1 = modelService.getModelByTableName(sequelize, table1_name.table_name, table1_name.table_schema);
            let table2 = modelService.getModelByTableName(sequelize, table2_name.table_name, table2_name.table_schema);
            let table1_attrs = table1.getAttributes();
            let table2_attrs = table2.getAttributes();
            for (const attr1 in table1_attrs) {
                if (table1_attrs[attr1].references) {
                    let attr1_references = modelService.getModelReference(table1_attrs[attr1].references);
                    if (table1_attrs[attr1].references &&
                        attr1_references.model.tableName === table2_name.table_name &&
                        attr1_references.model.schema === table2_name.table_schema)
                        return 1;
                }
            }
            for (const attr2 in table2_attrs) {
                if (table2_attrs[attr2].references) {
                    let attr2_references = modelService.getModelReference(table2_attrs[attr2].references);
                    if (attr2_references.model.tableName === table1_name.table_name &&
                        attr2_references.model.schema === table1_name.table_schema)
                        return -1;
                }
            }
            return 0;
        };
    }
    compareTablesByReferencesInDb(tables_for_cmp_func, modelService) {
        return function (table1_name_str, table2_name_str) {
            let table1_name = JSON.parse(table1_name_str);
            let table2_name = JSON.parse(table2_name_str);
            let table1_attrs = tables_for_cmp_func[table1_name_str];
            let table2_attrs = tables_for_cmp_func[table2_name_str];
            for (const attr1 in table1_attrs) {
                if (table1_attrs[attr1].references) {
                    let attr1_references = modelService.getModelReference(table1_attrs[attr1].references);
                    if (table1_attrs[attr1].references &&
                        attr1_references.model.tableName === table2_name.table_name &&
                        attr1_references.model.schema === table2_name.table_schema)
                        return 1;
                }
            }
            for (const attr2 in table2_attrs) {
                if (table2_attrs[attr2].references) {
                    let attr2_references = modelService.getModelReference(table2_attrs[attr2].references);
                    if (attr2_references.model.tableName === table1_name.table_name &&
                        attr2_references.model.schema === table1_name.table_schema)
                        return -1;
                }
            }
            return 0;
        };
    }
    getPgColumnsInfo(table_schema, table_name) {
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
    async getForeignKeyOptions(sequelize, name, table_schema) {
        let options = (await sequelize.query(`select constraint_schema, constraint_name, update_rule, delete_rule from information_schema.referential_constraints WHERE constraint_schema='${table_schema}';`)).at(0);
        for (const val in options) {
            if (options[val].constraint_name === name)
                return Promise.resolve({
                    update_rule: options[val].update_rule,
                    delete_rule: options[val].delete_rule,
                });
        }
        return Promise.resolve({ update_rule: null, delete_rule: null });
    }
    async generateTableInfo(sequelize, table_schema, table_name) {
        let res = {};
        const schema_table_columns = (await sequelize.query(`
                select * from (select att.attname, 
                    att.attndims, 
                    att.atttypmod,
                    pg_catalog.format_type(atttypid, NULL) as display_type 
                    from pg_attribute att 
                    join pg_class tbl on tbl.oid = att.attrelid  
                    join pg_namespace ns on tbl.relnamespace = ns.oid  
                    where tbl.relname = '${table_name}'
                    and ns.nspname = '${table_schema}') a JOIN (SELECT table_schema, table_name, column_name, data_type, character_maximum_length, column_default, is_nullable, udt_name FROM information_schema.columns WHERE table_schema='${table_schema}' AND table_name='${table_name}') b ON b.column_name = a.attname;`)).at(0);
        const schema_table_columns_constraints = (await sequelize.query(`${this.getColumnsConstraintsSchemaInfo(table_schema, table_name)}`)).at(0);
        //console.log(schema_table_columns_constraints);
        const pg_types = await sequelize.query(this.getPgColumnsInfo(table_schema, table_name));
        //console.log(await this.getTableExists(table_schema, table_name, sequelize));
        let schema_table_columns_comments = [];
        if (await this.getTableExists(table_schema, table_name, sequelize))
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
                if (column.column_name === constraint.column_name && column.table_name === table_name && column.table_schema === table_schema &&
                    constraint.constraint_type === 'FOREIGN KEY') {
                    res[column.column_name].foreign_key = true;
                    res[column.column_name].foreign_table_name = constraint.foreign_table_name;
                    res[column.column_name].foreign_column_name = constraint.foreign_column_name;
                    res[column.column_name].foreign_table_schema = constraint.foreign_table_schema;
                    res[column.column_name].fk_constraint_name = constraint.constraint_name;
                }
                if (column.column_name === constraint.column_name && column.table_name === table_name && column.table_schema === table_schema &&
                    column.column_name === constraint.column_name &&
                    constraint.constraint_type === 'PRIMARY KEY') {
                    res[column.column_name].primary_key = true;
                    res[column.column_name].pk_constraint_name = constraint.constraint_name;
                }
                if (column.column_name === constraint.column_name && column.table_name === table_name && column.table_schema === table_schema &&
                    column.column_name === constraint.column_name &&
                    constraint.constraint_type === 'UNIQUE') {
                    res[column.column_name].unique = true;
                    res[column.column_name].unique_constraint_name = constraint.constraint_name;
                }
            }
            for (const col of schema_table_columns_comments) {
                if (col.column_name === column.column_name && col.col_description !== null) {
                    res[column.column_name].comment = col.col_description;
                }
            }
        }
        return Promise.resolve(res);
    }
    async getRawType(sequelize, table_schema, table_name, column_name) {
        let table_info = await this.generateTableInfo(sequelize, table_schema, table_name);
        return Promise.resolve(table_info[column_name].pg_type);
    }
    async tableToModelInfo(sequelize, table_schema, table_name, options = { enum_values: [], column_name: '' }) {
        let table_info = await this.generateTableInfo(sequelize, table_schema, table_name);
        let res = {};
        for (const column in table_info) {
            res[column] = {};
            if (table_info[column].pg_type.match(/\"enum_\.*/) &&
                table_info[column].column_type !== 'ARRAY') {
                //ENUM TYPE
                let type_string = '';
                type_string += `Sequelize.ENUM(`;
                let enum_values = (await sequelize.query(`SELECT enum_range(NULL::${table_info[column].pg_type});`)).at(0).at(0);
                for (const val of enum_values.enum_range)
                    type_string += `'${val}',`;
                type_string += ')';
                res[column].type = type_string;
            }
            else if (table_info[column].column_type === 'ARRAY') {
                //ARRAY TYPE
                let type_string = '';
                let final_array_type = table_info[column].pg_type.replace('[]', '');
                //res[column].noDimensionType = sqlToSeqTypes[final_array_type];
                for (let i = 0; i < table_info[column].dimension; i++)
                    type_string += `Sequelize.ARRAY(`;
                if (interfaces_1.sqlToSeqTypes[final_array_type] === 'Sequelize.STRING') {
                    type_string += `Sequelize.STRING(${table_info[column].pg_max_length - pg_magic_round})`;
                }
                else if (final_array_type.match(/\"enum_\.*/)) {
                    let enum_values = (await sequelize.query(`SELECT enum_range(NULL::${table_info[column].pg_type.replace('[]', '')});`)).at(0).at(0);
                    type_string += 'Sequelize.ENUM(';
                    for (const val of enum_values.enum_range) {
                        type_string += `'${val}',`;
                        if (column === options.column_name) {
                            options.enum_values.push(val);
                            //console.log(options.enum_values)
                        }
                    }
                    type_string += ')';
                }
                else
                    type_string += `${interfaces_1.sqlToSeqTypes[final_array_type]}`;
                for (let i = 0; i < table_info[column].dimension; i++) {
                    type_string += ')';
                }
                res[column].type = type_string;
            }
            else if (table_info[column].column_type === 'character varying')
                res[column].type = `Sequelize.STRING(${table_info[column].max_length})`;
            else
                res[column].type = `${interfaces_1.sqlToSeqTypes[table_info[column].column_type]}`;
            if (table_info[column].default_value &&
                table_info[column].default_value.match(/\bnextval.*/)) {
                res[column].autoIncrement = true;
            }
            else if (table_info[column].default_value !== null)
                res[column].defaultValue = this.parseDefaultValue(table_info[column]);
            else
                res[column].defaultValue = undefined;
            if (table_info[column].is_nullable === 'YES') {
                res[column].allowNull = true;
            }
            else
                res[column].allowNull = false;
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
                let fk_options = await this.getForeignKeyOptions(sequelize, table_info[column].fk_constraint_name, table_info[column].table_schemas);
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
    parseDefaultValue(column_info) {
        let default_value = column_info.default_value;
        default_value = default_value.replace(/ARRAY/g, '');
        default_value = default_value.replace(/::character varying\([^)]*\)/g, '');
        default_value = default_value.replace(/::character varying/g, '');
        default_value = default_value.replace(/::"enum.*\".*/, '');
        return default_value;
    }
    getColumnsConstraintsSchemaInfo(table_schema, table_name) {
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
    async getTableIndexes(table_schema, table_name, sequelize) {
        let res = await sequelize.query(`SELECT tablename as "tableName", indexname as "indexName",indexdef as "indexDef" FROM pg_indexes WHERE schemaname = '${table_schema}' AND tablename = '${table_name}' ORDER BY tablename, indexname;`);
        return Promise.resolve(res);
    }
    async getTableColumnsComments(table_schema, table_name, sequelize) {
        let res = await sequelize.query(`select column_name, col_description('"${table_schema}"."${table_name}"'::regclass, ordinal_position)
            from information_schema.columns
            where table_schema = '${table_schema}' and table_name = '${table_name}';`);
        return Promise.resolve(res.at(0));
    }
    async getTableExists(table_schema, table_name, sequelize) {
        var _a;
        let res = await sequelize.query(`SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE  table_schema = '${table_schema}'
                AND    table_name   = '${table_name}');`);
        return Promise.resolve((_a = res.at(0).at(0)) === null || _a === void 0 ? void 0 : _a.exists);
    }
}
exports.DbService = DbService;
//# sourceMappingURL=db.service.js.map