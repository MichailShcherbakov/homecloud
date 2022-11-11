import { Column, Entity, Tree, TreeChildren, TreeParent } from "typeorm";
import { IEntity } from "./entity.interface";

@Entity("directories")
@Tree("closure-table", {
  closureTableName: "directory",
  ancestorColumnName: column => "ancestor_" + column.propertyName,
  descendantColumnName: column => "descendant_" + column.propertyName,
})
export class DirectoryEntity extends IEntity {
  @Column()
  name: string;

  @Column()
  size: number;

  @Column()
  relativePath: string;

  @TreeChildren()
  children: DirectoryEntity[];

  @Column({
    type: "uuid",
    nullable: true,
    default: null,
  })
  parentUuid: string | null;

  @TreeParent({ onDelete: "CASCADE" })
  parent: DirectoryEntity | null;

  clone(): DirectoryEntity {
    return Object.assign(new DirectoryEntity(), this);
  }
}
