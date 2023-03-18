import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, Index, createIndexDecorator } from 'sequelize-typescript';
import { Model1 } from './model1';
import { Model3 } from './model3';
const JobIndex = createIndexDecorator({
    // index options
    name: 'job-index',
    parser: 'my-parser',
    type: 'UNIQUE',
    unique: true,
    where: { fk1: 1},
    concurrently: true,
    using: 'BTREE',
    prefix: 'test-',
  });

@Table
class Model2 extends Model {
  @Unique
  @Column(DataType.INTEGER)
  fk1!: number;

  @PrimaryKey
  @Column
  fk3!: number

  @ForeignKey(() => Model3)
  @Column
  name!: number;

  @ForeignKey(() => Model1)
  @Column
  fk4!: number

  @BelongsTo(() => Model3, {onDelete: "NO ACTION", onUpdate: "NO ACTION"})
  model3!: Model3

  @BelongsTo(() => Model1, {onDelete: "CASCADE", onUpdate: "CASCADE"})
  model1!: Model1
}

export {Model2}