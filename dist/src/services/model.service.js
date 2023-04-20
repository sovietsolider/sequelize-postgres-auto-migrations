"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelService = void 0;
class ModelService {
    constructor(_sequelize) {
        this.sequelize = _sequelize;
    }
    getModelByTableName(sequelize, table_name, table_schema) {
        let res;
        for (const m in sequelize.models) {
            let tableName = sequelize.models[m].getTableName();
            if (typeof tableName === typeof {}) {
                if (sequelize.models[m].getTableName().tableName === table_name &&
                    sequelize.models[m].getTableName().schema === table_schema) {
                    res = sequelize.models[m];
                }
            }
            else {
                if (sequelize.models[m].getTableName() === table_name) {
                    res = sequelize.models[m];
                }
            }
        }
        return res;
    }
    getTypeByModelAttr(current_type, res_string = '', options = { enum_values: [], raw_type: '' }) {
        let type_name = current_type.constructor.name;
        if (typeof current_type == typeof '')
            res_string += `'${current_type}'`;
        else if (type_name === 'STRING') {
            let type_length = current_type._length;
            res_string += `Sequelize.STRING(${type_length})`;
        }
        else if (type_name !== 'ARRAY' && type_name !== 'ENUM' && type_name !== 'DATEONLY')
            res_string += `Sequelize.${type_name}`;
        else if (type_name === 'ARRAY') {
            res_string += `Sequelize.ARRAY(${this.getTypeByModelAttr(current_type.type, res_string, options)})`;
        }
        else if (type_name === 'DATEONLY')
            res_string += `Sequelize.DATE`;
        else if (type_name === 'ENUM') {
            //console.log(current_type.values)
            res_string += `Sequelize.ENUM(`;
            for (const [i, element] of current_type.values.entries()) {
                if (i === current_type.values.length - 1) {
                    options.enum_values.push(element);
                    res_string += `'${element}',)`;
                    continue;
                }
                options.enum_values.push(element);
                res_string += `'${element}',`;
            }
        }
        return res_string;
    }
    generateModelsInfo(sequelize) {
        let res = [];
        let models = sequelize.modelManager.all;
        for (const m of models) {
            if (typeof m.getTableName() === typeof {}) {
                res.push({
                    table_name: m.tableName,
                    table_schema: m.getTableName().schema,
                });
            }
            else {
                res.push({ table_name: m.tableName, table_schema: 'public' });
            }
        }
        return res;
    }
    getModelColumnsAsString(description) {
        const attrs_to_except = [
            'type',
            'Model',
            'fieldName',
            '_modelAttribute',
            'field',
            '_autoGenerated',
            'values',
            'name',
            'unique',
            'get',
            'validate',
            'comment'
        ];
        let res_string = '';
        for (const attr in description) {
            //console.log(attr);
            if (this.getTypeByModelAttr(description[attr].type) === 'Sequelize.VIRTUAL')
                continue;
            res_string += `${description[attr].field}: {`;
            for (const inside_attr in description[attr]) {
                if (inside_attr === 'type') {
                    res_string += `${inside_attr}: ${this.getTypeByModelAttr(description[attr].type)},`;
                }
                if (inside_attr === 'comment' && description[attr].comment != undefined)
                    res_string += `${inside_attr}: '${description[attr].comment}',`;
                else if (inside_attr === 'comment' && description[attr].comment === undefined)
                    res_string += `${inside_attr}: ${description[attr].comment},`;
                if (inside_attr === 'references') {
                    let reference = this.getModelReference(description[attr][inside_attr]);
                    res_string += `${inside_attr}: { model: {tableName: '${reference.model.tableName}', schema: '${reference.model.schema}'}, key: '${reference.key}'},`;
                    continue;
                }
                if (inside_attr === 'onDelete' || inside_attr === 'onUpdate') {
                    res_string += `${inside_attr}: "${description[attr][inside_attr]}",`;
                    continue;
                }
                if (!attrs_to_except.includes(inside_attr)) {
                    res_string += `${inside_attr}: ${description[attr][inside_attr]},`;
                }
            }
            res_string += '},';
        }
        return res_string;
    }
    getModelColumnDescriptionAsString(description, attr) {
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
            'unique_name',
            'get',
            'validate',
            'comment'
        ];
        let res_string = '';
        for (const inside_attr in description[attr]) {
            if (inside_attr === 'type') {
                res_string += `${inside_attr}: ${this.getTypeByModelAttr(description[attr].type)},`;
            }
            if (inside_attr === 'comment' && description[attr].comment !== undefined)
                res_string += `${inside_attr}: '${description[attr].comment}',`;
            else if (inside_attr === 'comment' && description[attr].comment === undefined)
                res_string += `${inside_attr}: ${description[attr].comment},`;
            if (!attrs_to_except.includes(inside_attr)) {
                res_string += `${inside_attr}: ${description[attr][inside_attr]},`;
            }
        }
        res_string += '},';
        return res_string;
    }
    getModelAttributesNames(description) {
        let res = [];
        for (const column in description)
            if (!(this.getTypeByModelAttr(description[column].type) === 'Sequelize.VIRTUAL')) {
                res.push(description[column].field);
            }
        return res;
    }
    getColumnNameByField(description, field) {
        let res = '';
        for (const column in description) {
            if (description[column].field === field) {
                res = column;
                break;
            }
        }
        return res;
    }
    getModelReference(model_references) {
        let res = {};
        if (typeof model_references.model === typeof {}) {
            res.model = model_references.model;
            res.key = model_references.key;
        }
        else if (typeof model_references.model === typeof '') {
            res.model = {
                tableName: model_references.model,
                schema: 'public',
            };
            res.key = model_references.key;
        }
        return res;
    }
    getModelUnique(unique_property) {
        if (typeof unique_property === typeof '')
            return;
    }
}
exports.ModelService = ModelService;
//# sourceMappingURL=model.service.js.map