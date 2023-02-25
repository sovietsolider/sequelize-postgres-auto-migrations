import { QueryTypes } from 'sequelize';
import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Sequelize } from 'sequelize-typescript';
import { compareTables, getModelByTableName } from './common/cmpFunctions';
import { singularize } from 'sequelize/types/utils';
import { generateMigrationFile } from './common/fileGen';

@Table({tableName: "book"})
class Book extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;
  
  @Column(DataType.STRING)
  name!: string;
}
@Table
class Person extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;
  
  @Column(DataType.STRING)
  name!: string;
}
@Table
class Item extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;
  
  @Column(DataType.STRING)
  name!: string;
}

export const sequelize = new Sequelize({
  database: 'test',
  dialect: 'postgres',
  host: "localhost",
  username: 'postgres',
  password: '666666',
  models: [Book, Person, Item], // or [Player, Team],
  define: {
    freezeTableName: true,
    timestamps: false,
  }
});


(async () => {
  console.log(Book.getAttributes())
  console.log(sequelize.models)
  //console.log(Book.getAttributes().name.type.constructor.name)
  //sequelize.sync({})
  //sequelize.models.Book
    //const jane = await Book.create({name: "If does not field"});
    //const antony = await Book.create({name: "Antony"});
    //const jj = await Person.create({name: "Jane"})
    //const Mile = await Person.build({name: "Mike", data: 22})
    //console.log(sequelize.models);
  let path = (generateMigrationFile("add-new"));
  compareTables(sequelize, path);
})();

//console.log(getModelByTableName(sequelize, "BookLL"));


