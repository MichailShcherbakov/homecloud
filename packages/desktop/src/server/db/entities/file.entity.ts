import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { DirectoryEntity } from "./directory.entity";
import { IEntity } from "./entity.interface";

@Entity("files")
export class FileEntity extends IEntity {
  @Column()
  name: string;

  @Column()
  size: number;

  @Column({ type: "varchar" })
  hash: string;

  @Column({
    type: "uuid",
    name: "directoryUuid",
    nullable: true,
    default: null,
  })
  directoryUuid?: string;

  @ManyToOne(() => DirectoryEntity, { onDelete: "CASCADE" })
  @JoinColumn({
    name: "directoryUuid",
    referencedColumnName: "uuid",
  })
  directory?: DirectoryEntity;

  clone(): FileEntity {
    return Object.assign(new DirectoryEntity(), this);
  }
}
