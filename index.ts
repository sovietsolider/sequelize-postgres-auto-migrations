import { AutoMigrations } from "./src/common/auto-migrations";
import { Sequelize } from "sequelize-typescript";
import { User } from "./tests/testModels/User";
import { Document } from "./tests/testModels/Document";
import { LogRecord } from "./tests/testModels/LogRecord";

export const sequelize = new Sequelize({
    database: 'empty',
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '666666',
    models: [LogRecord, User, Document],
    define: {
        freezeTableName: true,
    },
    logging: false
});
/*sequelize.query(`select column_name, data_type, col_description(public."Model1"::regclass, ordinal_position)
from information_schema.columns
where table_schema = 'public' and table_name = 'Model1';`).then(res => console.log(res));
*/
//sequelize.sync({force: true})
let auto_migrations = new AutoMigrations(sequelize);
auto_migrations.generateMigration('new', './migrations');

