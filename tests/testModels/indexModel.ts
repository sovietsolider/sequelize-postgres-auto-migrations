import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, Index, createIndexDecorator } from 'sequelize-typescript';
import { Model1 } from './model1';

const JobIndex = createIndexDecorator({
    // index options
    name: 'job-index',
    parser: 'my-parser',
    type: 'UNIQUE',
    unique: true,
    concurrently: true,
    using: 'BTREE',
    prefix: 'test-',
  });

@Table
class IndexModel extends Model {
    @Column
    Ind1!: number;
    @Column
    ind2!: number;
    @Column
    ind3!: number;
    @Column
    ind4!: number

}

@Table
class IndexModel2 extends Model {
    @Index
    @Column
    Ind1!: number;
    @Index
    @Column
    ind2!: number;
    @Column
    ind3!: number;
    @Column
    ind4!: number
}

export {IndexModel, IndexModel2}