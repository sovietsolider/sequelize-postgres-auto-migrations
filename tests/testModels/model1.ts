import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, createIndexDecorator, Index, Default } from 'sequelize-typescript';
import { Model2 } from './model2';
@Table
class Model1 extends Model {
    @AllowNull
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