export interface IEntityInfo {
  ino: bigint;
  name: string;
  size: bigint;
  absoluteDirectoryPath: string;
}

export interface FileInfo extends IEntityInfo {
  ext: string;
}

export interface DirectoryInfo extends IEntityInfo {}
