import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, createIndexDecorator, Index } from 'sequelize-typescript';
import { Op } from 'sequelize';
import {Model2} from "./model2"

const JobIndex = createIndexDecorator({
    // index options
    //name: 'job-index',
    parser: 'my-parser',
    type: 'UNIQUE',
    unique: true,
    where: [
        {[Op.or]:[{col1:20}, {col2:10}]}, {[Op.or]: [{col1: 20},{col2: 36}]}
    ], 
    concurrently: false,
    using: 'BTREE',
    prefix: 'test-',
    });

@Table
class Model1 extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    col1!: number

    @JobIndex({order: 'ASC', length: 127})
    @Column
    col2!: number

    @JobIndex({order: 'ASC', length: 127})
    @Column
    check_index!: number;

    @HasOne(() => Model2, {onDelete: 'CASCADE'})
    model2!: Model2;
}


export {Model1}