import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { DirectoryEntity } from "./directory.entity";
import { IEntity } from "./entity.interface";
import { FileEntity } from "./file.entity";
import { MetadataEntity } from "./metadata.entity";

@Entity("references")
export class ReferenceEntity extends IEntity {
  @Column({
    type: "uuid",
    name: "directoryUuid",
    nullable: true,
    default: null,
  })
  directoryUuid: string | null;

  @OneToOne(() => DirectoryEntity, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({
    name: "directoryUuid",
    referencedColumnName: "uuid",
  })
  directory: DirectoryEntity | null;

  @Column({
    type: "uuid",
    name: "fileUuid",
    nullable: true,
    default: null,
  })
  fileUuid: string | null;

  @OneToOne(() => FileEntity, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({
    name: "fileUuid",
    referencedColumnName: "uuid",
  })
  file: FileEntity | null;

  @Column({
    type: "uuid",
    name: "metadataUuid",
    nullable: true,
    default: null,
  })
  metadataUuid: string | null;

  @OneToOne(() => MetadataEntity, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({
    name: "metadataUuid",
    referencedColumnName: "uuid",
  })
  metadata: MetadataEntity | null;
}
