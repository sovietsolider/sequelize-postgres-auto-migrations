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
    Unique
} from 'sequelize-typescript';
import { Model1 } from './Model1';

@Table
export class Model2 extends Model {
    @Index
    @PrimaryKey
    @Column
    pk!: number;
    @PrimaryKey
    @Unique('antihype')
    @Column
    name2!: number;
    @PrimaryKey
    @Unique('antihype')
    @Column(DataType.STRING)
    name3!: string[][]
    //@HasOne(() => Model1) 
    //model2!: Model1;
}