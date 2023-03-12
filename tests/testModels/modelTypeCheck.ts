import {
    Model,
    Column,
    Table,
    DataType,
    PrimaryKey,
} from 'sequelize-typescript';

@Table
export class TypesModel extends Model {
    @Column(DataType.ARRAY(DataType.BIGINT))
    col1!: number[]
    @Column(DataType.BLOB)
    col2!: number;
    @Column(DataType.BOOLEAN)
    col3!: boolean
    @Column(DataType.CHAR)
    col4!: string
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