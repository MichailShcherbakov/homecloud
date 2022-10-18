import { Directory, File, Entity } from "../modules/file-system/type";
import * as fs from "fs/promises";
import { join, extname } from "path";
import * as uuid from "uuid";
import { access } from "./access";

export interface ReadDirOptions {
  localRootPath?: string;
  parentDirUuid?: string;
  includeExts?: string[];
  excludeExts?: string[];
  includeDirPaths?: string[];
  excludeDirPaths?: string[];
  onlyFiles?: boolean;
  onlyDirs?: boolean;
  collapseFolders?: boolean;
  collapseExt?: string;
}

export async function readDir(
  globalRootPath: string,
  options: ReadDirOptions = {}
): Promise<Entity[]> {
  const {
    localRootPath = "",
    parentDirUuid = null,
    includeExts = [],
    excludeExts = [],
    includeDirPaths = [],
    excludeDirPaths = [],
    onlyFiles,
    onlyDirs,
    collapseFolders,
    collapseExt,
  } = options;
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
        parentDirPath: localRootPath === "" ? "/" : localRootPath,
      };

      if (
        /// should be excluded
        excludeDirPaths.find(e => `${localPath}/`.startsWith(e)) ||
        /// not on the white list
        (includeDirPaths.length &&
          !includeDirPaths.find(e => `${localPath}/`.startsWith(e)))
      )
        return;

      if (entity.isDirectory()) {
        const directory: Directory = {
          ...baseEntity,
          isFile: false,
          isDirectory: true,
        };

        if (
          collapseFolders &&
          (await access(join(globalPath, `${entity.name}${collapseExt}`)))
        ) {
          const ext = collapseExt;

          if (
            /// should be excluded
            excludeExts.find(e => e === ext) ||
            /// not on the white list
            (includeExts.length && !includeExts.find(e => e === ext))
          )
            return;

          const file: File = {
            ...baseEntity,
            path: `${localPath}/${entity.name}${collapseExt}`,
            parentDirPath: localPath,
            name: baseEntity.name.replace(/\.[^/.]+$/, ""),
            ext: ext,
            isFile: true,
            isDirectory: false,
          };

          entities.push(file);

          return;
        }

        const entries = await readDir(globalPath, {
          ...options,
          localRootPath: localPath,
          parentDirUuid: directory.uuid,
        });

        directory.size = entries.reduce(
          (folderSize, entry) => folderSize + entry.size,
          0
        );

        if (!onlyFiles) entities.push(directory);
        entities.push(...entries);
      }

      if (entity.isFile() && !onlyDirs) {
        const ext = extname(globalPath);

        if (
          /// should be excluded
          excludeExts.find(e => e === ext) ||
          /// not on the white list
          (includeExts.length && !includeExts.find(e => e === ext))
        )
          return;

        const file: File = {
          ...baseEntity,
          name: baseEntity.name.replace(/\.[^/.]+$/, ""),
          ext: ext,
          isFile: true,
          isDirectory: false,
        };

        entities.push(file);
      }
    })
  );

  return entities;
}
