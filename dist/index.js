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
    models: [Model1_1.Model1],
    define: {
        freezeTableName: true,
    },
    logging: false
});
//sequelize.sync({force: true})
let auto_migrations = new auto_migrations_1.AutoMigrations(exports.sequelize);
auto_migrations.generateMigration('new', './migrations');
//# sourceMappingURL=index.js.map