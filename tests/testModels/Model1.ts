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
import { Model3 } from './Model3';

@Table
export class Model1 extends Model {
    @Index
    @ForeignKey(() => Model3)
    @PrimaryKey
    @Column
    pk!: number;

    @Unique(true)
    @Column
    name!: string;

    @BelongsTo(() => Model3, {onUpdate: 'RESTRICT'})
    model1!: Model3;
}