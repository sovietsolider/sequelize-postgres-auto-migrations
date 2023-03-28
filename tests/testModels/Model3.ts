import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, createIndexDecorator, Index, Default } from 'sequelize-typescript';
import { Model4 } from './Model4';
@Table
class Model3 extends Model {
    @ForeignKey(() => Model4)
    @Column
    FkToModel1!: string;

    @BelongsTo(() => Model4)
    model1!: Model4;
}


export {Model3}