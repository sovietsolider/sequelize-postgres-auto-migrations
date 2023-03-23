import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique } from 'sequelize-typescript';
import {Model2} from "./model2"

@Table({schema: 'temp'})
class Model4 extends Model {
    @Column
    col1!:number

    @HasOne(() => Model2)
    model2!: Model2;
}

export {Model4}