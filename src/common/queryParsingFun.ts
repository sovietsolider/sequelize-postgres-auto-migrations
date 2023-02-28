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
