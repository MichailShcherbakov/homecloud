import { join as joinPaths } from "path";
import { lstat, readdir } from "fs/promises";

export async function getDirSize(rootItemPath: string): Promise<number> {
  const fileSizes = new Map();

  await processItem(rootItemPath);

  async function processItem(itemPath: string) {
    const stats = await lstat(itemPath);

    fileSizes.set(stats.ino, stats.size);

    if (stats.isDirectory()) {
      const directoryItems = await readdir(itemPath);

      if (typeof directoryItems !== "object") return;

      await Promise.all(
        directoryItems.map(directoryItem =>
          processItem(joinPaths(itemPath, directoryItem))
        )
      );
    }
  }

  return Array.from(fileSizes.values()).reduce(
    (total, fileSize) => total + fileSize,
    0
  );
}
