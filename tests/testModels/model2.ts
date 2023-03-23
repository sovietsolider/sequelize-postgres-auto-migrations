import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, Index, createIndexDecorator } from 'sequelize-typescript';
import { Model1 } from './model1';
import { Model3 } from './model3';
import { Model4 } from './model4';
import { Model5 } from './model5';
@Table
class Model2 extends Model {
  @PrimaryKey
  @Column
  pk!: number

  @ForeignKey(() => Model4)
  @Column
  fk3!: number;

  @ForeignKey(() => Model1)
  @Column
  fk1!: number

  @ForeignKey(() => Model5)
  @Column
  fkToModel5!: number

  @BelongsTo(() => Model4)
  model3!: Model4

  @BelongsTo(() => Model1, {onDelete: 'CASCADE'})
  model1!: Model1
}

export {Model2}