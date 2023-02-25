import { Model, Sequelize } from "sequelize";

export interface modelInfoType {
    table_name: string;
    table_schema: string;
}


export function generateModelsInfo (sequelize: Sequelize) {
    let res = [];
    let models = sequelize.modelManager.all;
    for(const m of models) {
        if(typeof(m.getTableName()) === typeof({}) ) {
            res.push({table_name: m.tableName, table_schema: (m.getTableName() as unknown as { tableName: string, schema: string, delimiter: string}).schema})
        }
        else {
            res.push({table_name: m.tableName, table_schema: "public"})
        }
    }
    return res;
}