import {
    Model,
    Column,
    Table,
    DataType,
    PrimaryKey,
    ForeignKey,
    BelongsTo,
    HasOne,
    Index,
    AutoIncrement
} from 'sequelize-typescript';
import { Model1 } from './Model1';

@Table
export class Model3 extends Model {
    @PrimaryKey
    @Column
    pk!: string;
}