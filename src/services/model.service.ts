import { Sequelize } from 'sequelize';
import { ModelAttributeColumnOptions } from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';

export class ModelService {
    static getModelByTableName(sequelize: Sequelize, table_name: string, table_schema: string): ModelCtor<Model<any, any>> {
        let res;
        for (const m in sequelize.models) {
            let tableName = sequelize.models[m].getTableName();
            if (typeof tableName === typeof {}) {
                if ((sequelize.models[m].getTableName() as unknown as { tableName: string; schema: string }).tableName === table_name && (sequelize.models[m].getTableName() as unknown as { tableName: string; schema: string }).schema === table_schema) {
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

    static getTypeByModelAttr(current_type: any, res_string = '') {
        let type_name = current_type.constructor.name; //(description[attr].type as unknown as {option: any, type: string}).type.constructor.name
        if (type_name === 'STRING') {
            let type_length = current_type._length;

            res_string += `DataType.STRING(${type_length})`;
        } else if (type_name !== 'ARRAY' && type_name !== 'ENUM') res_string += `DataType.${type_name}`;
        else if (type_name === 'ARRAY') {
            res_string += `DataType.ARRAY(${this.getTypeByModelAttr(current_type.type, res_string)})`;
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

    static generateModelsInfo(sequelize: Sequelize) {
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

    static getModelColumnsAsString(description: { readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>> } | undefined): string {
        const attrs_to_except = ['type', 'Model', 'fieldName', '_modelAttribute', 'field', '_autoGenerated', 'values'];
        let res_string = '';
        for (const attr in description) {
            //console.log(attr);
            res_string += `${description[attr].field}: {`;
            for (const inside_attr in description[attr]) {
                if (inside_attr === 'type') {
                    res_string += `${inside_attr}: ${ModelService.getTypeByModelAttr(description[attr].type)},`;
                }
                if (inside_attr === 'references') {
                    let reference = description[attr][inside_attr] as {
                        model: string;
                        key: string;
                    };
                    res_string += `${inside_attr}: { model: "${reference.model}", key: "${reference.key}"},`;
                    continue;
                }
                if (inside_attr === 'onDelete' || inside_attr === 'onUpdate') {
                    res_string += `${inside_attr}: "${description[attr][inside_attr]}",`;
                    continue;
                }
                if (!attrs_to_except.includes(inside_attr)) {
                    res_string += `${inside_attr}: ${description[attr][inside_attr as keyof object]},`;
                }
            }
            res_string += '},';
        }
        return res_string;
    }

    static getModelColumnDescriptionAsString(description: { readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>> }, attr: string): string {
        const attrs_to_except = ['type', 'Model', 'fieldName', '_modelAttribute', 'field', '_autoGenerated', 'values'];
        let res_string = '';
        for (const inside_attr in description[attr]) {
            if (inside_attr === 'type') {
                res_string += `${inside_attr}: ${ModelService.getTypeByModelAttr(description[attr].type)},`;
            }
            if (inside_attr === 'references') {
                let reference = description[attr][inside_attr] as {
                    model: string;
                    key: string;
                };
                res_string += `${inside_attr}: { model: "${reference.model}", key: "${reference.key}"},`;
                continue;
            }
            if (inside_attr === 'onDelete' || inside_attr === 'onUpdate') {
                res_string += `${inside_attr}: "${description[attr][inside_attr]}",`;
                continue;
            }
            if (!attrs_to_except.includes(inside_attr)) {
                res_string += `${inside_attr}: ${description[attr][inside_attr as keyof object]},`;
            }
        }
        res_string += '},';
        return res_string;
    }

    static getModelAttributesNames(description: { readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>> } | undefined): Array<string> {
        let res: Array<string> = [];
        for (const column in description) res.push(description[column].field as string);
        return res;
    }

    static getColumnNameByField(description: { readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>> } | undefined, field: string): string {
        let res = '';
        for (const column in description) {
            if (description[column].field === field) {
                res = column;
                break;
            }
        }
        return res;
    }
}
