import {
    Model,
    Column,
    Table,
    DataType,
    PrimaryKey,
    Comment,
} from 'sequelize-typescript';

@Table
export class Model1 extends Model {
    @Comment('fdd')
    @Column
    name!: string;

}