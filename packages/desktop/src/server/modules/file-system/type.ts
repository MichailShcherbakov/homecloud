import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { FileEntity } from "@/server/db/entities/file.entity";

export interface File extends FileEntity {
  isFile: true;
  isDirectory?: false;
  isUploading: boolean;
}

export interface Directory extends DirectoryEntity {
  isFile?: false;
  isDirectory: true;
}

export type Entity = File | Directory;
