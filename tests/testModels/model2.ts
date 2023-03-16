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

    @ForeignKey(() => Model3) 
    fk4!: number

    @BelongsTo(() => Model3, 'fk3')
    f!: Model3;

    @BelongsTo(() => Model3, 'fk4')
    f1!: Model3
}

export {Model2}