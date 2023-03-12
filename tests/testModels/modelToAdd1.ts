import {
    Model,
    Column,
    Table,
    DataType,
    PrimaryKey,
  } from 'sequelize-typescript';
  
export interface BookURL {
    name?: string;
    text?: string;
    url?: string;
  }
  
  @Table({
    comment: 'Книги, которые есть в библиотеке',
  })
  export class Book extends Model {
    @Column(DataType.TEXT)
    authorsFullNames!: string;
  
    @Column(DataType.TEXT)
    authorsShortNames!: string;
  
    @Column(DataType.TEXT)
    libDescription!: string;
  
    @Column
    cipher!: string;
  
    @Column(DataType.TEXT)
    title!: string;
  
    @Column
    publisher!: string;
  
    @Column
    year!: number;
  
    @Column
    count!: number;
  
    @PrimaryKey
    @Column
    mfn!: number;
  
    @Column(DataType.JSONB)
    urls!: BookURL[];
  
    @Column
    db!: string;
  }

@Table
export class ModelToAdd extends Model {
  @Column({field: "ModelToAdd1Col1"})
  nn!: number
}


  