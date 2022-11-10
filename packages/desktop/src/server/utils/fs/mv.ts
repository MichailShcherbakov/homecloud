import { rename } from "fs/promises";

export async function mv(fromPath: string, toPath: string): Promise<void> {
  return rename(fromPath, toPath);
}
