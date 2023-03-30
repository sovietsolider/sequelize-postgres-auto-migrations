import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, createIndexDecorator, Index, Default } from 'sequelize-typescript';
import { Model2 } from './model2';
import { Model3 } from './Model3';
import { Model4 } from './Model4';
@Table
class Model1 extends Model {
    @AllowNull(false)
    @PrimaryKey
    @Column
    primaryCol!: number

    @Unique
    @Column
    primaryCol2!: string;

    @HasOne(() => Model3)
    model2!: Model3;
}


export {Model1}