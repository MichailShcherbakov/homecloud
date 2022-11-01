import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DirectoryEntity } from "./directory.entity";

@Entity("files")
export class FileEntity {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column()
  name: string;

  @Column()
  size: number;

  @Column({ unique: true })
  absolutePath: string;

  @Column({ unique: true })
  relativePath: string;

  @Column({ type: "uuid", name: "directory_uuid", nullable: true })
  public directoryUUID?: string;

  @ManyToOne(() => DirectoryEntity)
  @JoinColumn({
    name: "directory_uuid",
    referencedColumnName: "uuid",
  })
  public directory?: DirectoryEntity;
}
