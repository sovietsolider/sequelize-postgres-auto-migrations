import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique } from 'sequelize-typescript';
import {Model2} from "./model2"

@Table({schema: 'schema2'})
class Model5 extends Model {
    @HasOne(() => Model2)
    model2!: Model2;
}

export {Model5}