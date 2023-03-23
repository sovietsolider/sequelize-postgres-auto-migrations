import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, createIndexDecorator, Index } from 'sequelize-typescript';
import { Op } from 'sequelize';
import {Model2} from "./model2"

@Table
class Model1 extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    col1!: number

    @Column
    col2!: number

    @Column
    check_index!: number;
    
    @HasOne(() => Model2, {onDelete: 'RESTRICT'})
    model2!: Model2;
}


export {Model1}