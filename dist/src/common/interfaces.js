"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqlToSeqTypes = void 0;
exports.sqlToSeqTypes = {
    bigint: 'Sequelize.BIGINT',
    boolean: 'Sequelize.BOOLEAN',
    character: 'Sequelize.CHAR',
    'character varying': 'Sequelize.STRING',
    cidr: 'Sequelize.CIDR',
    date: 'Sequelize.DATE',
    'double precision': 'Sequelize.DOUBLE',
    inet: 'Sequelize.INET',
    integer: 'Sequelize.INTEGER',
    json: 'Sequelize.JSON',
    jsonb: 'Sequelize.JSONB',
    macaddr: 'Sequelize.MACADDR',
    real: 'Sequelize.REAL',
    smallint: 'Sequelize.SMALLINT',
    text: 'Sequelize.TEXT',
    time: 'Sequelize.TIME',
    'timestamp with zone': 'Sequelize.DATE',
    'timestamp with time zone': 'Sequelize.DATE',
    'timestamp without time zone': 'Sequelize.DATE',
    bytea: 'Sequelize.BLOB',
    citext: 'Sequelize.CITEXT',
    uuid: 'Sequelize.UUIDV1',
    numeric: 'Sequelize.DECIMAL',
};
//# sourceMappingURL=interfaces.js.map