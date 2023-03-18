import { Sequelize } from "sequelize-typescript";
import { ModelToAdd1 } from "../testModels/modelToAdd1";
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
  