import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique } from 'sequelize-typescript';
import {Model2} from "./model2"
@Table
class Model1 extends Model {
    @PrimaryKey
    @Column(DataType.INTEGER)
    model1Col2!: number

    @Column(DataType.ARRAY(DataType.ARRAY(DataType.STRING)))
    model1Col3!: boolean[][]

    @AllowNull(true)
    @Column({field: 'new_model1_field'})
    model1Col4!: string

    @HasOne(() => Model2)
    model2!: Model2
}


export {Model1}