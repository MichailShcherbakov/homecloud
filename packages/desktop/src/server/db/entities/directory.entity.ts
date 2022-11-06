import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("directories")
export class DirectoryEntity {
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

  @ManyToOne(() => DirectoryEntity, { onDelete: "CASCADE" })
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
