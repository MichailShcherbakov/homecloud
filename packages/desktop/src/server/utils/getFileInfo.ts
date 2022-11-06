import * as fs from "fs/promises";
import { parse } from "path";

export async function getFileInfo(path: string) {
  const stat = await fs.lstat(path);

  if (!stat.isFile()) return;

  const { ext, name, dir } = parse(path);

  return {
    name,
    ext,
    size: stat.size,
    absoluteDirPath: dir,
  };
}
