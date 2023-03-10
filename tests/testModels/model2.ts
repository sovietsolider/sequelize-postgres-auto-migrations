import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne } from 'sequelize-typescript';
import { Model1 } from './model1';

@Table
class Model2 extends Model {
    @Column
    model2Col1!: string;

    @Column(DataType.ENUM("5","2","1"))
    model2Col2!: string[]

    @ForeignKey(() => Model1)
    model2Fk!: number
}

export {Model2}