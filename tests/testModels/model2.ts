import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne } from 'sequelize-typescript';
import { Model3 } from './model3';

@Table
class Model2 extends Model {
    @Column
    model2Col1!: string;

    @Column(DataType.ENUM("5","5","5"))
    model2Col2!: number[]

    //@ForeignKey(() => Model3)
    @Column
    model2Fk!: number
}

export {Model2}