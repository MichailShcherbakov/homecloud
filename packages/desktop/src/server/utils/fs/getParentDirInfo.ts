import { basename, sep } from "path";

export interface DirInfo {
  path: string;
  name: string;
}

export function getParentDirInfo(path: string): DirInfo {
  const dirPath = path.split(sep).slice(0, -1).join(sep);

  const dirName = basename(dirPath);

  return {
    name: dirName,
    path: dirPath,
  };
}
