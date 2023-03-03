import { Sequelize } from "sequelize";

export class ModelService {
    static getModelByTableName(sequelize: Sequelize, table_name: string, table_schema: string) {
        let res;
        for (const m in sequelize.models) {
            let tableName = sequelize.models[m].getTableName();
            if (typeof tableName === typeof {}) {
                if ((sequelize.models[m].getTableName() as unknown as { tableName: string, tableSchema: string}).tableName === table_name 
                && (sequelize.models[m].getTableName() as unknown as { tableName: string, tableSchema: string }).tableSchema === table_schema) {
                    console.log('EQUALS!');
                    res = sequelize.models[m];
                }
            } else {
                if (sequelize.models[m].getTableName() === table_name) {
                    console.log('EQUALS!');
                    res = sequelize.models[m];
                }
            }
        }
        return res;
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
    
}