import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique } from 'sequelize-typescript';
import { Model1 } from './model1';
import { Model3 } from './model3';

@Table
class Model2 extends Model {
    @Column
    fk1!: number;

    @ForeignKey(() => Model3)
    @Column
    fk3!: number

    @BelongsTo(() => Model3)
    model1!: Model3
}

export {Model2}