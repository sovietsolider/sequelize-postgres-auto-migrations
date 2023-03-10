import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne } from 'sequelize-typescript';

@Table
class Model3 extends Model {
    @Column
    idd!: number;
}

export { Model3 }