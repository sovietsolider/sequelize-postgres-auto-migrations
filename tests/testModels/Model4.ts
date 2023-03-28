import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, createIndexDecorator, Index, Default } from 'sequelize-typescript';
import { Model3 } from './Model3';
@Table
class Model4 extends Model {
    @HasOne(() => Model3)
    model3!: Model3;
}


export {Model4}