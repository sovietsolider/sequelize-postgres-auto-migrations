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
export class Model2 extends Model {
    @Index
    @PrimaryKey
    @Column
    pk!: number;
    @Column
    name2!: string;
    //@Column(DataType.ARRAY(DataType.ENUM("1","2")))
    //name3!: string[][]
    @HasOne(() => Model1) 
    model2!: Model1;
}