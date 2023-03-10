import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne } from 'sequelize-typescript';
import {Model2} from "./model2"
@Table
class Model1 extends Model {
    @Column(DataType.STRING)
    model1Col1!: string

    @Column(DataType.ARRAY(DataType.STRING(175)))
    model1Col2!: number

    @Column(DataType.ARRAY(DataType.INTEGER))
    model1Col3!: number[]

    @HasOne(() => Model2)
    model2!: Model2
}


export {Model1}