import {
    Model,
    Column,
    Table,
    DataType,
    PrimaryKey,
    ForeignKey,
    BelongsTo,
    HasOne,
    Index
} from 'sequelize-typescript';
import { Model1 } from './Model1';

@Table
export class Model4 extends Model {
    @Column
    pk!: number;
    @HasOne(() => Model1) 
    model2!: Model1;

    @PrimaryKey
    @Column
    pk2!: string;
}