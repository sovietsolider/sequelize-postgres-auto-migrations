import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, createIndexDecorator, Index, Default } from 'sequelize-typescript';
import { Model1 } from './model1';
import { Model2 } from './model2';
import { Model3 } from './Model3';
@Table
class Model4 extends Model {
    @AllowNull(false)
    @PrimaryKey
    @Unique
    @Column
    primaryCol!: number

    @ForeignKey(() => Model3)
    @Column
    fkToModel1!: number

    @BelongsTo(() => Model3) 
    model1!: Model3

    @HasOne(() => Model2)
    model3!: Model2;
}


export {Model4}