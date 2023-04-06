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
import { ModelToAdd1 } from './ModelToAdd1';

@Table
export class Model1 extends Model {
    @ForeignKey(() => Model4)
    @PrimaryKey
    @Column
    pk!: number;

    @Unique(false)
    @Column
    name!: string;

    @Column
    newFk!: number

    @BelongsTo(() => Model4, {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
    model1!: Model3;

    @HasOne(() => ModelToAdd1)
    modelToAdd1!: ModelToAdd1;
}