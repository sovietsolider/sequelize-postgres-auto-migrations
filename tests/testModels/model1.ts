import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique } from 'sequelize-typescript';
import {Model2} from "./model2"
@Table
class Model1 extends Model {
    @Unique({name: '1', msg:'fine'})
    @Column
    col1!: number

    @Column
    col2!: number
    
    @Unique
    @Column
    col3!: number

    @Column
    col4!: number;

    @PrimaryKey
    @Column
    col5!: number

    @Unique
    @Column
    col6!: number
}


export {Model1}