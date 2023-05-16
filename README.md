# sequelize-postgres-auto-migrations
Supports sequelize-typescript with sequelize v6. Tested only with sequelize-typescript.
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
Migrations are not created if non-executed migrations exists.  
Restrictions:  
* Currently available only for postgres
* Currently doesn't support partial indexes