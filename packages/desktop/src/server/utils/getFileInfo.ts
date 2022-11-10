export interface IEntityInfo {
  ino: string;
  name: string;
  size: number;
  absoluteDirectoryPath: string;
}

export interface FileInfo extends IEntityInfo {
  ext: string;
}

export interface DirectoryInfo extends IEntityInfo {}
