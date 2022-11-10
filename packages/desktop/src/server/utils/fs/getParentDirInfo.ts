import { basename } from "path";

export interface DirInfo {
  path: string;
  name: string;
}

export function getParentDirInfo(path: string): DirInfo {
  const dirPath = path.split("\\").slice(0, -1).join("\\");

  const dirName = basename(dirPath);

  return {
    name: dirName,
    path: dirPath,
  };
}
