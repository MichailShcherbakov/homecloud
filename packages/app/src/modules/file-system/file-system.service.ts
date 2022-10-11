import { Injectable } from "@nestjs/common";
import { Entity } from "./type";
import * as fs from "fs/promises";
import { join, extname } from "path";

async function deepReadDir(
  rootDirPath: string,
  depth?: number
): Promise<Entity[]> {
  const rootDir = await fs.readdir(rootDirPath, { withFileTypes: true });
  const entities: Entity[] = [];

  if (depth !== undefined) {
    if (depth < 1) return entities;

    depth--;
  }

  await Promise.all(
    rootDir.map(async entity => {
      const path = join(rootDirPath, entity.name);
      const stat = await fs.lstat(path);

      const baseEntity: Entity = {
        name: entity.name,
        path,
        size: stat.size,
        isFile: false,
        isDirectory: false,
      };

      if (entity.isDirectory()) {
        const entries = await deepReadDir(path, depth);

        baseEntity.size = entries.reduce(
          (folderSize, entry) => folderSize + entry.size,
          0
        );
        baseEntity.isDirectory = true;

        entities.push(...entries);
      }

      if (entity.isFile()) {
        baseEntity.ext = extname(path);
        baseEntity.dirPath = rootDirPath;
        baseEntity.isFile = true;
      }

      entities.push(baseEntity);
    })
  );

  return entities;
}

@Injectable()
export class FileSystemService {
  readDir(path: string, depth?: number): Promise<Entity[]> {
    return deepReadDir(path, depth);
  }
}
