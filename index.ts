import { AutoMigrations } from "./src/common/auto-migrations";
import { Sequelize } from "sequelize-typescript";
import { User } from "./tests/testModels/User";
import { Document } from "./tests/testModels/Document";
import { LogRecord } from "./tests/testModels/LogRecord";
import { HistoryRecord } from "./tests/testModels/HistoryRecord";
import { Session } from "./tests/testModels/Session";
//import { Model1, Model1_p, Model2, Model2_p, Model2_test, Model3 } from "./tests/testModels/Model1";
import { Model1, Model1_p, Model2, Model2_p, Model3, Model4 } from "./tests/testModels/Model1";

export const sequelize = new Sequelize({
    database: 'gia',
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '666666',
    models: [User, Document, LogRecord, HistoryRecord, Session],
    define: {
        timestamps: false
    },
    logging: false
});
//  console.log((sequelize.models.User.getAttributes().roles.type as any).type.values);
/*sequelize.query(`select column_name, data_type, col_description(public."Model1"::regclass, ordinal_position)
from information_schema.columns
where table_schema = 'public' and table_name = 'Model1';`).then(res => console.log(res));
*/
//sequelize.sync({force: true})
let auto_migrations = new AutoMigrations(sequelize);
auto_migrations.generateMigration('new', './migrations');

