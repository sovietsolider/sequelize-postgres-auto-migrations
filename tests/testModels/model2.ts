import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, Index, createIndexDecorator } from 'sequelize-typescript';
import { Model1 } from './model1';
import { Model3 } from './model3';

@Table
class Model2 extends Model {
  @PrimaryKey
  @Column
  pk!: number

  @ForeignKey(() => Model3)
  @Column
  fk3!: number;

  @ForeignKey(() => Model1)
  @Column
  fk1!: number

  @BelongsTo(() => Model3)
  model3!: Model3

  @BelongsTo(() => Model1)
  model1!: Model1
}

export {Model2}