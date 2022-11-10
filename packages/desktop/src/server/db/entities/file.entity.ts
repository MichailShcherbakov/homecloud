import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { DirectoryEntity } from "./directory.entity";
import { IEntity } from "./entity.interface";

@Entity("files")
export class FileEntity extends IEntity {
  @Column()
  name: string;

  @Column({ type: "varchar" })
  private _size: string;

  @Column({ type: "varchar" })
  hash: string;

  @Column({ type: "uuid", name: "directory_uuid", nullable: true })
  directoryUuid?: string;

  @ManyToOne(() => DirectoryEntity, { onDelete: "CASCADE" })
  @JoinColumn({
    name: "directory_uuid",
    referencedColumnName: "uuid",
  })
  directory?: DirectoryEntity;

  get size(): bigint {
    return BigInt(this._size);
  }

  set size(val: bigint) {
    this._size = val.toString();
  }
}
