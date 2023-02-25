import { QueryTypes } from "sequelize";
import { Sequelize, Model, ModelCtor } from "sequelize-typescript";
import { writeToMigrationFile } from "./fileGen";
import { table } from "console";
import { ObjectType } from "typescript";

export function getModelByTableName(sequelize: Sequelize, table_name: string) {
    let res;
    for(const m in sequelize.models) {
        if(sequelize.models[m].getTableName() === table_name) {
            console.log("EQUALS!")
            res = sequelize.models[m];
        }
        //console.log(sequelize.models[m].getTableName())
    }
    //console.log(res);
    return res;
}

function generateStringToAddTable(model: ModelCtor<Model<any, any>> | undefined) {
    let description = model?.getAttributes();
    const attrs_to_except = ["type", "Model", "fieldName", "_modelAttribute", "field"]
    let res_string = `await queryInterface.createTable("${model?.getTableName()}",{`;
    for(const attr in description) {
        res_string += `${attr}: { type: DataType.${description[attr].type.constructor.name},`;
        for(const inside_attr in description[attr]) {
            //console.log("INSIDE ATTRS")
            //console.log(description[attr][inside_attr as keyof object]);
            console.log(typeof(String(inside_attr)))
            if(!attrs_to_except.includes(inside_attr)) {
                res_string += `${inside_attr}: ${description[attr][inside_attr as keyof object]},`
            }
        }
        res_string += "},"
    }
    res_string += `},{ transaction: t},);`
    return res_string
    
}


export async function compareTables(sequelize: Sequelize, pathToMigrationFile: string) {
    //only for testing
    //
    const schema_info_tables = await sequelize.query("SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema!='pg_catalog' AND table_schema!='information_schema'")
    const schema_tables: Array<any> = schema_info_tables.at(0) as Array<any>;
    const metadata: Array<any> = schema_info_tables.at(1) as Array<any>
    let tables: Array<any> = [];
    for(const i in sequelize.models) {
        tables.push({table_name: sequelize.models[i].getTableName(), table_schema: sequelize.models.Book.options.schema})
    }
    const schema_table_names = schema_tables.map((val: any) => val.table_name);
    const table_names = tables.map((val: any) => val.table_name);

    //console.log(table_names.includes("Book"));
    console.log(schema_table_names)
    console.log(table_names)
    if(schema_tables.length !== Object.keys(sequelize.models).length) {
        for(let table_name of table_names) {
            if(!(schema_table_names.includes(table_name))) {
                let curr_model = getModelByTableName(sequelize, table_name);
                //let desc = curr_model?.getAttributes();
                let curr_model_description = JSON.stringify(curr_model?.getAttributes());
                let stringToAdd = generateStringToAddTable(curr_model as ModelCtor<Model<any, any>> | undefined)
                writeToMigrationFile(pathToMigrationFile, stringToAdd)
            }
        }
        //revert for deleting
        console.log("WORKS")
    }
    console.log(schema_tables);
    console.log(tables);
}