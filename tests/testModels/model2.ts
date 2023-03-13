import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique } from 'sequelize-typescript';
import { Model1 } from './model1';
import { Model3 } from './model3';

@Table
class Model2 extends Model {
    @ForeignKey(() => Model1)
    @Unique
    @Column
    fk1!: number;

    @BelongsTo(() => Model1, { onDelete: 'RESTRICT', onUpdate: 'RESTRICT'})
    model3!: Model3
}

export {Model2}