import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique } from 'sequelize-typescript';
import {Model2} from "./model2"
@Table({schema: 'temp'})
class Model4 extends Model {
    @Unique
    @Column
    col1!: number

    @Unique
    @Column
    col2!: number

}

export {Model4}