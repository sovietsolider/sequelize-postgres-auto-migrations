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
    Unique,
    Default
} from 'sequelize-typescript';
import { Model1 } from './Model1';

@Table
export class Model4 extends Model {
    @PrimaryKey
    @Column
    pk!: number;
    @HasOne(() => Model1) 
    model2!: Model1;

    @Unique(false)
    @Column
    unCol!: string
}