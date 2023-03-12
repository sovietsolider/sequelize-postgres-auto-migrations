import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne } from 'sequelize-typescript';
import { Model3 } from './model3';

@Table
class Model2 extends Model {
    @Column(DataType.STRING(101))
    model2Col1!: string;

    @Column(DataType.ENUM("one","two","three"))
    model2Col2!: number[]
    
    @AllowNull(true)
    @ForeignKey(() => Model3)
    @Column
    model2Fk!: number
}

export {Model2}