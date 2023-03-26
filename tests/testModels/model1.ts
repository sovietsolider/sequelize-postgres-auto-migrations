import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, createIndexDecorator, Index } from 'sequelize-typescript';
import { Model2 } from './model2';
@Table
class Model1 extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    primaryCol!: number

    @Unique
    @Column
    primaryCol2!: number;

    @HasOne(() => Model2)
    model2!: Model2;
}


export {Model1}