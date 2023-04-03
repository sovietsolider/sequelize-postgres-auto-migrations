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

@Table({tableName: 'newTable1'})
export class ModelToAdd1 extends Model {
    @Index('1')
    @PrimaryKey
    @Column(DataType.ARRAY(DataType.BIGINT))
    col1!: number[]

    @Index('1')
    @PrimaryKey
    @Column(DataType.BLOB)
    col2!: number;

    @Unique('f')
    @Column(DataType.BOOLEAN)
    col3!: boolean

    @Unique('f')
    @Column(DataType.CHAR)
    col4!: string

    @Unique
    @Column(DataType.CIDR)
    col5!: string

    @Column(DataType.DATE)
    col7!: string

    @Column(DataType.DATEONLY)
    col8!: string

    @Column(DataType.DECIMAL(10, 2))
    col9!: number

    @Column(DataType.DOUBLE)
    col10!: string
}