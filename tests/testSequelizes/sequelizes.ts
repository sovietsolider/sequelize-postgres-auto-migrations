import { Sequelize } from "sequelize-typescript";
import { ModelToAdd1 } from "../testModels/modelToAdd1";
import { Model4 } from "../testModels/model4";

import { Model1 } from "../testModels/model1";
import { Model2 } from "../testModels/model2";
import { Model3 } from "../testModels/model3";

export const sequelize_adding_tables_test = new Sequelize({
    database: 'empty',
    dialect: 'postgres',
    host: "localhost",
    username: 'postgres',
    password: '666666',
    models: [ModelToAdd1], 
    define: {
        freezeTableName: true,
        timestamps: false,
    }
});
  
export const sequelize_deleting_tables_test = new Sequelize({
    database: 'delete_tables',
    dialect: 'postgres',
    host: "localhost",
    username: 'postgres',
    password: '666666',
    models: [], 
    define: {
        freezeTableName: true,
        timestamps: false,
    }
});

export const sequelize_adding_tables_with_fk = new Sequelize({
    database: 'empty',
    dialect: 'postgres',
    host: "localhost",
    username: 'postgres',
    password: '666666',
    models: [Model4, Model2, Model3, Model1], 
    define: {
        freezeTableName: true,
        timestamps: false,
    }
});

export const sequelize_deleting_tables_with_fk = new Sequelize({
    database: 'delete_fk_tables',
    dialect: 'postgres',
    host: "localhost",
    username: 'postgres',
    password: '666666',
    models: [], 
    define: {
        freezeTableName: true,
        timestamps: false,
    }
});