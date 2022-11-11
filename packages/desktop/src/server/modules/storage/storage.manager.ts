import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { FileEntity } from "@/server/db/entities/file.entity";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { FileService } from "./file.service";
import { DirectoryService } from "./directory.service";
import { join } from "path";
import { ROOT_RELATIVE_PATH } from "../config/config.constants";

/**
 * @private
 */
@Injectable()
export class StorageManager {
  constructor(
    private readonly config: ConfigService,
    private readonly fileService: FileService,
    private readonly directoryService: DirectoryService
  ) {}

  /**
   * @returns
   */
  public getRootDirectories(): Promise<DirectoryEntity[]> {
    return this.directoryService.getRootDirectories();
  }

  /**
   * @returns
   */
  public getDirectoriesCount(): Promise<number> {
    return this.directoryService.getDirectoriesCount();
  }

  /**
   * @param uuid
   * @returns
   */
  public getDirectoryByUuid(uuid: string): Promise<DirectoryEntity | null> {
    return this.directoryService.getDirectoryByUuid(uuid);
  }

  /**
   *  Returns directory of a certain uuid. Throw an error when a directory was not found.
   *  @param uuid
   *  @returns directory
   */
  public getDirectoryByUuidOrFail(uuid: string): Promise<DirectoryEntity> {
    return this.directoryService.getDirectoryByUuidOrFail(uuid);
  }

  /**
   * Returns directory of a certain relative path
   * @param relativePath
   * @returns directory or null
   */
  public async getDirectoryByRelativePath(
    relativePath: string
  ): Promise<DirectoryEntity | null> {
    return this.directoryService.getDirectoryByRelativePath(relativePath);
  }

  /**
   * Returns directory of a certain relative path. Throw an error when a directory was not found.
   * @param relativePath
   * @returns directory
   */
  public async getDirectoryByRelativePathOrFail(
    relativePath: string
  ): Promise<DirectoryEntity> {
    return this.directoryService.getDirectoryByRelativePathOrFail(relativePath);
  }

  /**
   * @param directory
   * @returns
   */
  public getDirectoriesIn(
    directory: DirectoryEntity
  ): Promise<DirectoryEntity[]> {
    return this.directoryService.getDirectoriesIn(directory);
  }

  /**
   * @param directory
   * @returns
   */
  public getAncestorsDirectory(
    directory: DirectoryEntity
  ): Promise<DirectoryEntity[]> {
    return this.directoryService.getAncestorsDirectory(directory);
  }

  /**
   * @param directory
   * @returns
   */
  public async createDirectory(
    directory: Pick<DirectoryEntity, "name" | "size" | "clone">,
    destDirectory: DirectoryEntity | null = null
  ): Promise<DirectoryEntity> {
    const directoryClone = directory.clone();
    directoryClone.parent =
      destDirectory; /* needs to be above of the function of getting relative path */
    directoryClone.relativePath = await this.getRelativePathByEntity(
      directoryClone
    );

    /** TODO: Check name exists */

    return this.directoryService.saveDirectory(directoryClone);
  }

  /**
   * @param directory
   * @param name
   * @returns
   */
  public async renameDirectory(
    directory: DirectoryEntity,
    name: string
  ): Promise<DirectoryEntity> {
    const directoryClone = directory.clone();
    directoryClone.name = name;
    directoryClone.relativePath = await this.getRelativePathByEntity(
      directoryClone
    );

    /** TODO: Check name exists */

    const updatedDirectory = await this.directoryService.saveDirectory(
      directoryClone
    );

    await this.updateEntityPath(updatedDirectory, directory);

    return updatedDirectory;
  }

  /**
   * @param directory
   * @param destDirectory
   * @returns
   */
  public async moveDirectory(
    directory: DirectoryEntity,
    destDirectory: DirectoryEntity | null = null
  ): Promise<DirectoryEntity> {
    const directoryClone = directory.clone();
    directoryClone.parent = destDirectory;
    directoryClone.relativePath = await this.getRelativePathByEntity(
      directoryClone
    );

    const updatedDirectory = await this.directoryService.saveDirectory(
      directoryClone
    );

    /** TODO: Check name exists */

    await Promise.all([
      this.updateEntitySize(directory, "decrease"),
      this.updateEntitySize(updatedDirectory, "increase"),
      this.updateEntityPath(updatedDirectory, directory),
    ]);

    return updatedDirectory;
  }

  /**
   * @param uuid
   */
  public async deleteDirectoryByUuid(uuid: string): Promise<DirectoryEntity> {
    const directory = await this.getDirectoryByUuidOrFail(uuid);

    await this.updateEntitySize(directory, "decrease");

    await this.directoryService.deleteDirectoryByUuid(uuid);

    return directory;
  }

  /**
   * @returns count
   */
  public getFilesCount(): Promise<number> {
    return this.fileService.getFilesCount();
  }

  /**
   * @returns Array of files
   */
  public getRootFiles(): Promise<FileEntity[]> {
    return this.fileService.getRootFiles();
  }

  /**
   * @param uuid
   * @returns file or null
   */
  public getFileByUuid(uuid: string): Promise<FileEntity | null> {
    return this.fileService.getFileByUuid(uuid);
  }

  /**
   * @param uuid
   * @returns file
   */
  public getFileByUuidOrFail(uuid: string): Promise<FileEntity> {
    return this.fileService.getFileByUuidOrFail(uuid);
  }

  /**
   * @param absolutePath
   * @returns file or null
   */
  public async getFileByRelativePath(
    absolutePath: string
  ): Promise<FileEntity | null> {
    return this.fileService.getFileByRelativePath(absolutePath);
  }

  /**
   * @param absolutePath
   * @returns file
   */
  public async getFileByRelativePathOrFail(
    absolutePath: string
  ): Promise<FileEntity> {
    return this.fileService.getFileByRelativePathOrFail(absolutePath);
  }

  /**
   * @param directory
   * @returns Array of files
   */
  public getFilesIn(directory: DirectoryEntity): Promise<FileEntity[]> {
    return this.fileService.getFilesIn(directory);
  }

  /**
   * @param file
   * @returns
   */
  public async createFile(
    file: Pick<FileEntity, "name" | "size" | "hash" | "clone">,
    destDirectory: DirectoryEntity | null = null
  ): Promise<FileEntity> {
    const fileClone = file.clone();
    fileClone.directory = destDirectory;
    fileClone.relativePath = await this.getRelativePathByEntity(fileClone);

    /** TODO: Check name exists */

    const newFile = await this.fileService.saveFile(fileClone);

    await this.updateEntitySize(newFile, "increase");

    return newFile;
  }

  /**
   * @param file
   * @param name
   * @returns
   */
  public async renameFile(file: FileEntity, name: string): Promise<FileEntity> {
    const fileClone = file.clone();
    fileClone.name = name;
    fileClone.relativePath = await this.getRelativePathByEntity(fileClone);

    /** TODO: Check name exists */

    const updatedFile = await this.fileService.saveFile(fileClone);

    return updatedFile;
  }

  /**
   * @param file
   * @param destDirectory
   * @returns
   */
  public async moveFile(
    file: FileEntity,
    destDirectory: DirectoryEntity | null = null
  ): Promise<FileEntity> {
    await this.updateEntitySize(file, "decrease");

    const fileClone = file.clone();
    fileClone.directory = destDirectory;
    fileClone.relativePath = await this.getRelativePathByEntity(fileClone);

    /** TODO: Check name exists */

    const updatedFile = await this.fileService.saveFile(fileClone);

    await this.updateEntitySize(updatedFile, "increase");

    return updatedFile;
  }

  /**
   * @param uuid
   * @returns
   */
  public async deleteFileByUuid(uuid: string): Promise<FileEntity> {
    const foundFile = await this.getFileByUuidOrFail(uuid);

    await this.updateEntitySize(foundFile, "decrease");

    await this.fileService.deleteFileByUuid(uuid);

    return foundFile;
  }

  /**
   * @private
   * @param entity
   * @returns
   */
  private async getRelativePathByEntity<
    TEntity extends FileEntity | DirectoryEntity
  >(entity: TEntity): Promise<string> {
    let directoryUuid: string | null = null;

    if (entity instanceof FileEntity) {
      directoryUuid = entity.directory?.uuid ?? entity.directoryUuid;
    } else if (entity instanceof DirectoryEntity) {
      directoryUuid = entity.parent?.uuid ?? entity.parentUuid;
    } else {
      throw new Error(
        `The given entity is not FileEntity or DirectoryEntity: ${typeof entity}`
      );
    }

    if (directoryUuid) {
      const parentDirectory = await this.getDirectoryByUuidOrFail(
        directoryUuid
      );
      return join(parentDirectory.relativePath, entity.name);
    }

    return join(ROOT_RELATIVE_PATH, entity.name);
  }

  /**
   * @private
   * @param entity
   * @returns
   */
  private async getParentDirectoryByEntity<
    TEntity extends FileEntity | DirectoryEntity
  >(entity: TEntity): Promise<DirectoryEntity | null> {
    let directoryUuid: string | null = null;

    if (entity instanceof FileEntity) {
      directoryUuid = entity.directoryUuid;
    } else if (entity instanceof DirectoryEntity) {
      directoryUuid = entity.parentUuid;
    } else {
      throw new Error(
        `The given entity is not FileEntity or DirectoryEntity: ${typeof entity}`
      );
    }

    if (!directoryUuid) return null;

    return this.getDirectoryByUuidOrFail(directoryUuid);
  }

  /**
   * @private
   * @param entity
   * @param kind increase | decrease
   */
  private async updateEntitySize<TEntity extends FileEntity | DirectoryEntity>(
    entity: TEntity,
    kind: "increase" | "decrease"
  ): Promise<void> {
    const directory = await this.getParentDirectoryByEntity(entity);

    /* in the root */
    if (!directory) return;

    const ancestors = await this.getAncestorsDirectory(directory);

    for (const ancestor of ancestors) {
      if (kind === "increase") {
        ancestor.size += entity.size;
      } else if (kind === "decrease") {
        ancestor.size -= entity.size;
      }
    }

    await this.directoryService.saveDirectories(ancestors);
  }

  /**
   * @private
   * @param entity
   */
  private async updateEntityPath<TEntity extends FileEntity | DirectoryEntity>(
    newEntity: TEntity,
    oldEntity: TEntity
  ): Promise<void> {
    if (oldEntity instanceof FileEntity) return;

    const descendants = await this.directoryService.getDescendantsByPath(
      oldEntity.relativePath
    );

    await this.directoryService.saveDirectories(
      descendants.map(directory => {
        const directoryClone = directory.clone();
        directoryClone.relativePath = join(
          newEntity.relativePath,
          directoryClone.relativePath.replace(oldEntity.relativePath, "")
        );
        return directoryClone;
      })
    );
  }
}
