import {
    Model,
    Column,
    Table,
    DataType,
    PrimaryKey,
    BelongsToMany, 
    ForeignKey,
    AutoIncrement,
    Default,
    AllowNull,
    Unique
} from 'sequelize-typescript';

@Table({tableName: 'model_add_1', schema: 'temp'})
export class ModelToAdd1 extends Model {
  @Unique
  @Column
  colUnique!: number;

  @PrimaryKey
  @Column
  colPK!: number;

  @AutoIncrement
  @Column
  colAI!: number;

  @Default(5)
  @Column
  colDefault!: number;

  @AllowNull
  @Column
  colAllowNull!: number;
}
