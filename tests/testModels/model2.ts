import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, createIndexDecorator, Index } from 'sequelize-typescript';
import { Model1 } from './model1';

@Table
class Model2 extends Model {
    @ForeignKey(() => Model1)
    @Column
    FkToModel1!: string;

    @BelongsTo(() => Model1)
    model1!: Model1;
}


export {Model2}