import { Column, Entity, Index } from "typeorm";
import { IEntity } from "./entity.interface";

@Entity("metadata")
export class MetadataEntity extends IEntity {
  @Index({ unique: true })
  @Column({ unique: true })
  path: string;

  @Column({ default: false })
  isFile: boolean;

  @Column({ default: false })
  isDirectory: boolean;

  @Column({ unique: true })
  ino: string;
}
