import { Column, Entity, Tree, TreeChildren, TreeParent } from "typeorm";
import { IEntity } from "./entity.interface";

@Entity("directories")
@Tree("closure-table", {
  closureTableName: "directory_closure",
  ancestorColumnName: column => "ancestor_" + column.propertyName,
  descendantColumnName: column => "descendant_" + column.propertyName,
})
export class DirectoryEntity extends IEntity {
  @Column()
  name: string;

  @Column({ type: "varchar" })
  private _size: string;

  @Column({ type: "varchar" })
  hash: string;

  @TreeChildren()
  children: DirectoryEntity[];

  @TreeParent()
  parent: DirectoryEntity | null;

  get size(): bigint {
    return BigInt(this._size);
  }

  set size(val: bigint) {
    this._size = val.toString();
  }

  clone(): DirectoryEntity {
    return Object.assign(new DirectoryEntity(), this);
  }
}
