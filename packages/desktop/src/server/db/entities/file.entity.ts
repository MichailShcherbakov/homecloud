import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { DirectoryEntity } from "./directory.entity";
import { IEntity } from "./entity.interface";
import { MetadataEntity } from "./metadata.entity";

@Entity("files")
export class FileEntity extends IEntity {
  @Column()
  name: string;

  @Column()
  size: number;

  @Column()
  relativePath: string;

  @Column({ type: "varchar" })
  hash: string;

  @Column({
    type: "uuid",
    name: "directoryUuid",
    nullable: true,
    default: null,
  })
  directoryUuid: string | null;

  @ManyToOne(() => DirectoryEntity, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({
    name: "directoryUuid",
    referencedColumnName: "uuid",
  })
  directory: DirectoryEntity | null;

  clone(): FileEntity {
    return Object.assign(new DirectoryEntity(), this);
  }
}
