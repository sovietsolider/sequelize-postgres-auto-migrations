import { QueryTypes } from "sequelize";
import { Sequelize, Model, ModelCtor } from "sequelize-typescript";
import { writeToMigrationFile } from "./fileGen";
import { table } from "console";
import { ObjectType } from "typescript";
import { generateModelsInfo, modelInfoType } from "./modelsInfoGen";

export function getModelByTableName(sequelize: Sequelize, table_name: string) {

    let res;
    for(const m in sequelize.models) {
        let tableName = sequelize.models[m].getTableName();
        if(typeof(tableName) === typeof({})) {
            if((sequelize.models[m].getTableName() as { tableName: string }).tableName === table_name) {
                console.log("EQUALS!")
                res = sequelize.models[m];
            }
        }
        else {
            if(sequelize.models[m].getTableName() === table_name) {
                console.log("EQUALS!")
                res = sequelize.models[m];
            }
        }
        //console.log(sequelize.models[m].getTableName())
    }
    //console.log(res);
    return res;
}

function generateStringToAddTable(model: ModelCtor<Model<any, any>> | undefined, model_schema: string | undefined, table_name: string) {
    console.log("GENERATE STRING SCHEMA NAME")
    let description = model?.getAttributes();
    console.log(description)
    const attrs_to_except = ["type", "Model", "fieldName", "_modelAttribute", "field"]
    let res_string = `await queryInterface.createTable("${table_name}",{`;
    for(const attr in description) {
        res_string += `${attr}: { type: DataType.${description[attr].type.constructor.name},`;
        for(const inside_attr in description[attr]) {
            //console.log("INSIDE ATTRS")
            //console.log(description[attr][inside_attr as keyof object]);
            //console.log(typeof(String(inside_attr)))
            if(!attrs_to_except.includes(inside_attr)) {
                res_string += `${inside_attr}: ${description[attr][inside_attr as keyof object]},`
            }
        }
        res_string += "},"
    }
    res_string += `},{ transaction: t, schema: "${model_schema}"},);`
    return res_string
}

function generateStringToDeleteTable(model_schema: string | undefined, table_name: string) {
    return `await queryInterface.dropTable("{ tableName: ${table_name}, tableSchema: ${model_schema}}",{ transaction: t, cascade: true }`;
}


export async function compareTables(sequelize: Sequelize, pathToMigrationFile: string) {
    const schema_info_tables = await sequelize.query("SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema!='pg_catalog' AND table_schema!='information_schema'")

    const schema_tables: Array<any> = schema_info_tables.at(0) as Array<any>;
    const tables: modelInfoType[] = generateModelsInfo(sequelize) as unknown as modelInfoType[];

    //const metadata: Array<any> = schema_info_tables.at(1) as Array<any>
    //let tables: Array<any> = [];

    //const schema_table_names = schema_tables.map((val: any) => val.table_name);
    //const table_names = tables.map((val: any) => val.table_name);

    console.log("SCHEMA TABLES")
    console.log(schema_tables);
    console.log("TABLES")
    console.log(tables);
    //console.log(table_names.includes("Book"));
    //console.log(schema_table_names)
    //console.log(table_names)
    //if(schema_tables.length !== tables.length) {
        for(const table of tables) {
            console.log(schema_tables.indexOf(table))
            if(!schema_tables.find(element => element.table_name === table?.table_name && element.table_schema === table?.table_schema)) {
                console.log("ADDING")
                let curr_model = getModelByTableName(sequelize, table?.table_name);
                let stringToAdd = generateStringToAddTable(curr_model as ModelCtor<Model<any, any>> | undefined, table?.table_schema, table?.table_name)
                writeToMigrationFile(pathToMigrationFile, stringToAdd)
            }
        }
        //revert for deleting
        for(const schema_table of schema_tables) {
            console.log(schema_table)
            if(!tables.find(element => element.table_name === schema_table.table_name && element.table_schema === schema_table.table_schema)) {
                console.log("DELETING")
                let stringToAdd = generateStringToDeleteTable(schema_table.table_schema, schema_table.table_name);
                writeToMigrationFile(pathToMigrationFile, stringToAdd)
            }
        }
    //}

}