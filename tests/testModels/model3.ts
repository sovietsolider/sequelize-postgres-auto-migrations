import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne } from 'sequelize-typescript';
import { Model2 } from './model2';

@Table
class Model3 extends Model {
    @AllowNull(false)
    @Column
    model3Col1!: string;

    @Column
    forFk1!: number;

    @HasOne(() => Model2)
    model2!: Model2;
}

export { Model3 }