import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, createIndexDecorator, Index } from 'sequelize-typescript';
import { Model1 } from './model1';
import { Model4 } from './Model4';
@Table
class Model2 extends Model {
    @Unique
    @ForeignKey(() => Model4)
    @Column
    FkToModel1!: number;

    @BelongsTo(() => Model4, {onUpdate: 'RESTRICT', onDelete: 'RESTRICT'})
    model1!: Model4;
}


export {Model2}