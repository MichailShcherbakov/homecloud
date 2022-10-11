export interface Entity {
  path: string;
  name: string;
  size: number;
  ext?: string; /// only if file
  dirPath?: string; /// only if file
  isDirectory: boolean;
  isFile: boolean;
}
