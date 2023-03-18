import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique } from 'sequelize-typescript';
import {Model2} from "./model2"
@Table
class Model1 extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    col1!: number

    @Column(DataType.ARRAY(DataType.ENUM("1", "2", "3")))
    col2!: string[][]

    @HasOne(() => Model2)
    model2!: Model2;
}


export {Model1}