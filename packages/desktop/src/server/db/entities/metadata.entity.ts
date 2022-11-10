import { IEntityInfo } from "@/server/utils/getFileInfo";
import { Column, Entity, Index } from "typeorm";
import { IEntity } from "./entity.interface";
import { parse, basename } from "path";

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

  getInfo(): IEntityInfo {
    if (this.isDirectory) {
      const dir = this.path.split("\\").slice(0, -1).join("\\");

      const name = basename(this.path);

      return {
        ino: this.ino,
        name,
        size: 0,
        absoluteDirectoryPath: dir,
      };
    }

    if (this.isFile) {
      const { name, dir } = parse(this.path);

      return {
        ino: this.ino,
        name,
        size: 0,
        absoluteDirectoryPath: dir,
      };
    }

    throw new Error(`Failed to get info`);
  }
}
