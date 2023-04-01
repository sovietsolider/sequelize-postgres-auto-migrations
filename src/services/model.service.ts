import { Sequelize } from 'sequelize-typescript';
import { ModelAttributeColumnOptions } from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';
import { MigrationOptions } from '../common/interfaces';
export class ModelService {
    sequelize: Sequelize;
    migration_options: MigrationOptions | undefined;
    constructor(_sequelize: Sequelize) {
        this.sequelize = _sequelize;
    }
    getModelByTableName(
        sequelize: Sequelize,
        table_name: string,
        table_schema: string,
    ): ModelCtor<Model<any, any>> {
        let res;
        for (const m in sequelize.models) {
            let tableName = sequelize.models[m].getTableName();
            if (typeof tableName === typeof {}) {
                if (
                    (
                        sequelize.models[m].getTableName() as unknown as {
                            tableName: string;
                            schema: string;
                        }
                    ).tableName === table_name &&
                    (
                        sequelize.models[m].getTableName() as unknown as {
                            tableName: string;
                            schema: string;
                        }
                    ).schema === table_schema
                ) {
                    res = sequelize.models[m];
                }
            } else {
                if (sequelize.models[m].getTableName() === table_name) {
                    res = sequelize.models[m];
                }
            }
        }
        return res as ModelCtor<Model<any, any>>;
    }

    getTypeByModelAttr(current_type: any, res_string = '') {
        let type_name = current_type.constructor.name; 
        if(typeof current_type == typeof '') 
            res_string += `'${current_type}'`;
        else if (type_name === 'STRING') {
            let type_length = current_type._length;
            res_string += `Sequelize.STRING(${type_length})`;
        } else if (type_name !== 'ARRAY' && type_name !== 'ENUM' && type_name !== 'DATEONLY')
            res_string += `Sequelize.${type_name}`;
        else if (type_name === 'ARRAY')
            res_string += `Sequelize.ARRAY(${this.getTypeByModelAttr(
                current_type.type,
                res_string,
            )})`;
        else if (type_name === 'DATEONLY') res_string += `Sequelize.DATE`;
        else if (type_name === 'ENUM') {
            //console.log(current_type.values)
            res_string += `Sequelize.ENUM(`;
            for (const [i, element] of current_type.values.entries()) {
                if (i === current_type.values.length - 1) {
                    res_string += `'${element}',)`;
                    continue;
                }
                res_string += `'${element}',`;
            }
        }
        return res_string;
    }

    generateModelsInfo(sequelize: Sequelize) {
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

    getModelColumnsAsString(
        description:
            | {
                  readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
              }
            | undefined,
    ): string {
        const attrs_to_except = [
            'type',
            'Model',
            'fieldName',
            '_modelAttribute',
            'field',
            '_autoGenerated',
            'values',
            'name',
        ];
        let res_string = '';
        for (const attr in description) {
            //console.log(attr);
            res_string += `${description[attr].field}: {`;
            for (const inside_attr in description[attr]) {
                if (inside_attr === 'type') {
                    res_string += `${inside_attr}: ${this.getTypeByModelAttr(
                        description[attr].type,
                    )},`;
                }
                if (inside_attr === 'references') {
                    let reference = this.getModelReference(description[attr][inside_attr] as {
                        model: string | {
                            tableName: string;
                            schema: string;
                        };
                        key: string;
                    });
                    res_string += `${inside_attr}: { model: {tableName: '${reference.model.tableName}', schema: '${reference.model.schema}'}, key: '${reference.key}'},`;
                    continue;
                }
                if (inside_attr === 'onDelete' || inside_attr === 'onUpdate') {
                    res_string += `${inside_attr}: "${description[attr][inside_attr]}",`;
                    continue;
                }
                if (!attrs_to_except.includes(inside_attr)) {
                    res_string += `${inside_attr}: ${
                        description[attr][inside_attr as keyof object]
                    },`;
                }
            }
            res_string += '},';
        }
        return res_string;
    }

    getModelColumnDescriptionAsString(
        description: {
            readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
        },
        attr: string,
    ): string {
        const attrs_to_except = [
            'type',
            'Model',
            'fieldName',
            '_modelAttribute',
            'field',
            '_autoGenerated',
            'values',
            'unique',
            'primaryKey',
            'name',
            'references', 
            'onUpdate',
            'onDelete',
            'defaultValue',
            'pk_name',
            'fk_name',
            'unique_name'
        ];
        let res_string = '';
        for (const inside_attr in description[attr]) {
            if (inside_attr === 'type') {
                res_string += `${inside_attr}: ${this.getTypeByModelAttr(
                    description[attr].type,
                )},`;
            } 
            if (!attrs_to_except.includes(inside_attr)) {
                res_string += `${inside_attr}: ${description[attr][inside_attr as keyof object]},`;
            }
        }
        res_string += '},';
        return res_string;
    }

    getModelAttributesNames(
        description:
            | {
                  readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
              }
            | undefined,
    ): Array<string> {
        let res: Array<string> = [];
        for (const column in description) res.push(description[column].field as string);
        return res;
    }

    getColumnNameByField(
        description:
            | {
                  readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
              }
            | undefined,
        field: string,
    ): string {
        let res = '';
        for (const column in description) {
            if (description[column].field === field) {
                res = column;
                break;
            }
        }
        return res;
    }

    getModelReference(model_references: {
        model: { tableName: string; schema: string } | string;
        key: string;
    }) {
        let res: any = {};
        if (typeof model_references.model === typeof {}) {
            res.model = model_references.model as {
                tableName: string;
                schema: string;
            };
            res.key = model_references.key;
        } else if (typeof model_references.model === typeof '') {
            res.model = {
                tableName: model_references.model as string,
                schema: 'public',
            };
            res.key = model_references.key;
        }
        return res as {
            model: { tableName: string; schema: string };
            key: string;
        };
    }

    getModelUnique(unique_property: string | {name: string, msg: string} | boolean) {
        if(typeof unique_property === typeof '')
            return 
    }
}
