import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, createIndexDecorator, Index } from 'sequelize-typescript';

@Table
class Model1 extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    primaryCol!: number
}


export {Model1}