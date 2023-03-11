# sequelize-auto-migrations
To generate migration file follow the steps below:
```ts
const auto_migrations = new AutoMigrations(sequelize);  
auto_migrations.generateMigration(migration_name, migration_path);
```
