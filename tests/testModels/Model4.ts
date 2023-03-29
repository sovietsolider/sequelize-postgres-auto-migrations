import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, createIndexDecorator, Index, Default } from 'sequelize-typescript';
import { Model3 } from './Model3';
import { Model2 } from './model2';
@Table
class Model4 extends Model {
    @AllowNull(false)
    @PrimaryKey
    @Unique
    @Column
    primaryCol!: number

    @HasOne(() => Model2)
    model3!: Model2;
}


export {Model4}