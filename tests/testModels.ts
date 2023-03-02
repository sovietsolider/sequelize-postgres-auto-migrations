import { Table, Column, Model, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo, ForeignKey, AllowNull } from 'sequelize-typescript';

@Table
class Person extends Model {
    @HasMany(() => Book, 'authorId')
    writtenBooks!: Book[];

    @HasMany(() => Book, 'proofreaderId')
    proofedBooks!: Book[];
}

@Table
class Book extends Model {
    @ForeignKey(() => Person)
    @Column
    authorId!: number;

    @Column(DataType.STRING(176))
    name!: string;

    @Column(DataType.ARRAY(DataType.ARRAY(DataType.ARRAY(DataType.STRING(70)))))
    name_array!: string[][][];

    @Column(DataType.ENUM("ONE", "TWO", "THREE",))
    nameE!: string[]

    @ForeignKey(() => Person)
    @Column(DataType.SMALLINT)
    proofreaderId!: number;

    @BelongsTo(() => Person, 'authorId')
    author!: Person;

    @BelongsTo(() => Person, 'proofreaderId')
    proofreader!: Person;
}

@Table({ schema: 'temp' })
class Item extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column
    id!: number;

    @PrimaryKey
    @Column
    name!: string;
}

@Table({tableName: "Item"})
class AnotherItem extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column
  name!: string;
}

@Table
class ArrayTypeModel extends Model {
  @Column(DataType.ARRAY(DataType.STRING))
  names_array!: string[]
}

@Table
class EnumTypeModel extends Model {
  @Column(DataType.ARRAY(DataType.ARRAY(DataType.INTEGER)))
  names_enum!: number[]
}
export {Person, Book, Item, AnotherItem, ArrayTypeModel, EnumTypeModel}