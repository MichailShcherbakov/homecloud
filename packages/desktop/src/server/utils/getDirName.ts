import { basename } from "path";

export function getDirName(path: string) {
  return basename(path);
}
