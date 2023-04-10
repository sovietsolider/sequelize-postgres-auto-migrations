# sequelize-postgres-auto-migrations
Supports Sequelize v6  
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
