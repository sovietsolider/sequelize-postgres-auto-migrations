import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull, HasOne, Unique, Index, createIndexDecorator } from 'sequelize-typescript';
import { Model1 } from './model1';
import { Model3 } from './model3';

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
    @Index({unique: true, using: 'hash'})
    @Column
    Ind1!: number;
    @Column
    ind2!: number;
    @Column
    ind3!: number;
}

export {IndexModel}