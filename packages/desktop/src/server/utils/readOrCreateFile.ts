import { readFile, writeFile } from "fs/promises";
import { access, accessSync } from "./access";
import { readFileSync, writeFileSync } from "fs";

export const readOrCreateFile = async (
  path: string,
  defaultContent = ""
): Promise<string> => {
  const isExists = await access(path);

  if (!isExists) await writeFile(path, defaultContent);

  return readFile(path, "utf-8");
};

export const readOrCreateFileSync = (
  path: string,
  defaultContent = ""
): string => {
  const isExists = accessSync(path);

  if (!isExists) writeFileSync(path, defaultContent);

  return readFileSync(path, "utf-8");
};
