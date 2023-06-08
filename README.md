# sequelize-postgres-auto-migrations
This package helps you in the boring process of writing migration files by yourself and supports **sequelize-typescript** with **sequelize v6.** Tested only with sequelize-typescript.  
Npm package is available https://www.npmjs.com/package/sequelize-postgres-auto-migrations  
To generate migration file follow the steps below:
```ts
import { AutoMigrations } from 'sequelize-postgres-auto-migrations';
const sequelize = new Sequelize({
        dialect: 'postgres',
        host: 'host',
        username: 'username',
        password: 'password',
        database: 'database',
        models: [],
});
const auto_migrations = new AutoMigrations(sequelize);  
auto_migrations.generateMigration('migration_name', 'migration_path');
```
**Examples**:  
Let's imagine we have a new model, defined with sequelize-typescript, which doesn't exist in Postgres database:  
```ts
@Table
export class TestModel extends Model {
    @Column
    name!: string

    @Column
    phone!: string
}
```  
So we need sequelize migration file to make our DB up to date. What do we need?  
Just create script with these three lines:
```ts
import { AutoMigrations } from 'sequelize-postgres-auto-migrations';

const sequelize = new Sequelize({ //or import your Sequelize object
        dialect: 'postgres',
        host: 'host',
        username: 'username',
        password: 'password',
        database: 'database',
        models: [TestModel],
});

const auto_migrations = new AutoMigrations(sequelize);  
auto_migrations.generateMigration('migration_name', 'migration_path')
```  
After running script you can see a new migration file in migrations folder, let's check it out:  
```js
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.createTable({
                tableName: 'TestModels',
                schema: 'public'
            }, {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                },
                name: {
                    type: Sequelize.STRING(255),
                },
                phone: {
                    type: Sequelize.STRING(255),
                },
            }, {
                transaction: t,
                schema: 'public'
            });
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.dropTable({
                tableName: 'TestModels',
                schema: 'public'
            }, {
                transaction: t
            });
        });
    },
};
```  
You can see generated migration file for creating a new table.  
***You can use this package for adding, deleting, editing tables, columns, foreign keys and other constraint. This package also supports using different schemes.***  
Migrations are not created if non-executed migrations exists.  
Restrictions:  
* Currently available only for postgres
* Currently doesn't support partial indexes