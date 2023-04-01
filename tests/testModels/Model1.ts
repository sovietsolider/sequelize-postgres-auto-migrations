import {
    Model,
    Column,
    Table,
    DataType,
    PrimaryKey,
    HasOne,
    ForeignKey,
    BelongsTo,
    Index,
    Unique
} from 'sequelize-typescript';
import { Model2 } from './Model2';

@Table
export class Model1 extends Model {
    @Index
    @ForeignKey(() => Model2)
    @PrimaryKey
    @Column
    pk!: number;

    @Unique(true)
    @Column
    name!: string;

    @BelongsTo(() => Model2)
    model1!: Model2;
}