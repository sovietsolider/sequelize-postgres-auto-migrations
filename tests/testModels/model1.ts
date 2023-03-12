import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne } from 'sequelize-typescript';
import {Model2} from "./model2"
@Table
class Model1 extends Model {
    @Column(DataType.ARRAY(DataType.STRING(1734)))
    model1Col2!: number

    @Column(DataType.ARRAY(DataType.INTEGER))
    model1Col3!: number[]

    @AllowNull(true)
    @Column({field: 'new_model1_field'})
    model1Col4!: string
}


export {Model1}