import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, createIndexDecorator, Index, Default } from 'sequelize-typescript';
import { Model4 } from './Model4';
import { Model1 } from './model1';
@Table
class Model3 extends Model {
    @ForeignKey(() => Model1)
    @Column
    FkToModel1!: number;

    @Column
    newCol!: number;

    @BelongsTo(() => Model1, {onUpdate: 'RESTRICT', onDelete: 'RESTRICT'})
    model1!: Model1;

    @HasOne(() => Model4)
    model4!: Model4
}


export {Model3}