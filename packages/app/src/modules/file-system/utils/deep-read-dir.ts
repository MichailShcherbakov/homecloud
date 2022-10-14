import { Directory, File, Entity } from "../type";
import * as fs from "fs/promises";
import { join, extname } from "path";
import * as uuid from "uuid";

export async function deepReadDir(
  globalRootPath: string,
  localRootPath = "",
  parentDirUuid: string | null = null
): Promise<Entity[]> {
  const rootDir = await fs.readdir(globalRootPath, { withFileTypes: true });
  const entities: Entity[] = [];

  await Promise.all(
    rootDir.map(async entity => {
      const localPath = `${localRootPath}/${entity.name}`;
      const globalPath = join(globalRootPath, entity.name);
      const stat = await fs.lstat(globalPath);

      const baseEntity = {
        uuid: uuid.v4(),
        name: entity.name,
        path: localPath,
        size: stat.size,
        parentDirUuid,
      };

      if (entity.isDirectory()) {
        const directory: Directory = {
          ...baseEntity,
          isFile: false,
          isDirectory: true,
        };
        const entries = await deepReadDir(
          globalPath,
          localPath,
          baseEntity.uuid
        );

        baseEntity.size = entries.reduce(
          (folderSize, entry) => folderSize + entry.size,
          0
        );

        entities.push(directory);
        entities.push(...entries);
      }

      if (entity.isFile()) {
        const file: File = {
          ...baseEntity,
          ext: extname(globalPath),
          isFile: true,
          isDirectory: false,
        };
        entities.push(file);
      }
    })
  );

  return entities;
}
