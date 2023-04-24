"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const auto_migrations_1 = require("./src/common/auto-migrations");
const sequelize_typescript_1 = require("sequelize-typescript");
const User_1 = require("./tests/testModels/User");
const Document_1 = require("./tests/testModels/Document");
const LogRecord_1 = require("./tests/testModels/LogRecord");
const HistoryRecord_1 = require("./tests/testModels/HistoryRecord");
const Session_1 = require("./tests/testModels/Session");
exports.sequelize = new sequelize_typescript_1.Sequelize({
    database: 'gia',
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '666666',
    models: [User_1.User, Document_1.Document, LogRecord_1.LogRecord, HistoryRecord_1.HistoryRecord, Session_1.Session],
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
let auto_migrations = new auto_migrations_1.AutoMigrations(exports.sequelize);
auto_migrations.generateMigration('new', './migrations');
//# sourceMappingURL=index.js.map