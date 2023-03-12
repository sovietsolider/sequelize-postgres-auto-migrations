import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne } from 'sequelize-typescript';
import { Model1 } from './model1';
import { Model3 } from './model3';

@Table
class Model2 extends Model {
    @PrimaryKey
    @Column(DataType.STRING(101))
    model2Col1!: string;

    @Column(DataType.ENUM("one","two","three"))
    model2Col2!: number[]
    
    @AllowNull(false)
    @ForeignKey(() => Model1)
    @Column
    model2Fk!: number

    @ForeignKey(() => Model3)
    @Column
    model2Fk2!: number
}

export {Model2}