import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, Index, createIndexDecorator } from 'sequelize-typescript';
import { Model1 } from './model1';
import { Model3 } from './model3';
@Table
class Model2 extends Model {
  @PrimaryKey
  @Column
  pk!: number

  @ForeignKey(() => Model1)
  @Column
  fk1!: number

  @Column
  col1!: number

  @BelongsTo(() => Model1)
  model1!: Model1
}

export {Model2}