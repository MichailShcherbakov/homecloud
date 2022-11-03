import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @Column({ type: "uuid", name: "parent_directory_uuid", nullable: true })
  public parentDirectoryUUID?: string;

  @ManyToOne(() => DirectoryEntity)
  @JoinColumn({
    name: "parent_directory_uuid",
    referencedColumnName: "uuid",
  })
  public parentDirectory?: DirectoryEntity;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
