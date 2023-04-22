"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const auto_migrations_1 = require("./src/common/auto-migrations");
const sequelize_typescript_1 = require("sequelize-typescript");
const Model1_1 = require("./tests/testModels/Model1");
exports.sequelize = new sequelize_typescript_1.Sequelize({
    database: 'empty',
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '666666',
    models: [Model1_1.Model1, Model1_1.Model2, Model1_1.Model3, Model1_1.Model2_test, Model1_1.Model2_p],
    define: {
        timestamps: false
    },
    logging: false
});
//console.log(sequelize.models.Model1.getAttributes().fk.references);
/*sequelize.query(`select column_name, data_type, col_description(public."Model1"::regclass, ordinal_position)
from information_schema.columns
where table_schema = 'public' and table_name = 'Model1';`).then(res => console.log(res));
*/
//sequelize.sync({force: true})
let auto_migrations = new auto_migrations_1.AutoMigrations(exports.sequelize);
auto_migrations.generateMigration('new', './migrations');
//# sourceMappingURL=index.js.map