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
export class Model3 extends Model {
    @Index({type: 'FULLTEXT', using:'BTREE', order: 'DESC'})
    @PrimaryKey
    @Column
    pk!: number;
    @Column
    name2!: string;
    @HasOne(() => Model1) 
    model2!: Model1;
}