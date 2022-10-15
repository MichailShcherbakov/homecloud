export interface IEntity {
  uuid: string;
  path: string;
  name: string;
  size: number;
  parentDirUuid: string | null;

  /// a file
  isFile: boolean;
  ext?: string;

  /// a dir
  isDirectory: boolean;
}

export interface File extends IEntity {
  isFile: true;
  isDirectory: false;
}

export interface Directory extends IEntity {
  isFile: false;
  isDirectory: true;
  ext?: undefined;
}

export type Entity = File | Directory;
