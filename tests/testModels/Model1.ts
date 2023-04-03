import {
    Model,
    Column,
    Table,
    DataType,
    PrimaryKey,
    HasOne,
    ForeignKey,
    BelongsTo,
    Index,
    Unique,
    AllowNull
} from 'sequelize-typescript';
import { Model2 } from './Model2';
import { Model3 } from './Model3';
import { Model4 } from './Model4';

@Table
export class Model1 extends Model {
    @ForeignKey(() => Model4)
    @PrimaryKey
    @Column
    pk!: number;

    @AllowNull(false)
    @Unique(false)
    @Column
    name!: string;

    @BelongsTo(() => Model4, {onUpdate: 'RESTRICT'})
    model1!: Model3;
}