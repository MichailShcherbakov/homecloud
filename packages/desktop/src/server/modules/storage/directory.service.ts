import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, TreeRepository } from "typeorm";
import { ConfigService } from "../config/config.service";
import * as fs from "fs/promises";
import { computeHash } from "@/server/utils/format/computeFileHash";
import { FileEntity } from "@/server/db/entities/file.entity";
import { join } from "path";

/**
 * @private
 */
@Injectable()
export class DirectoryService {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(DirectoryEntity)
    private readonly directoryRepository: TreeRepository<DirectoryEntity>
  ) {}

  /**
   *  @param
   *  @returns count
   */
  public getDirectoriesCount(): Promise<number> {
    return this.directoryRepository.count();
  }

  /**
   *
   * @returns
   */
  public getRootDirectories(): Promise<DirectoryEntity[]> {
    return this.directoryRepository.findBy({
      parent: IsNull(),
    });
  }

  /**
   *  Returns directory of a certain uuid.
   *  @param uuid
   *  @returns directory or null
   */
  public getDirectoryByUuid(uuid: string): Promise<DirectoryEntity | null> {
    return this.directoryRepository.findOneBy({
      uuid,
    });
  }

  /**
   *  Returns directory of a certain hash.
   *  @param hash
   *  @returns directory or null
   */
  public getDirectoryByHash(hash: string): Promise<DirectoryEntity | null> {
    return this.directoryRepository.findOneBy({
      hash,
    });
  }

  public async getDirectoryHashByAbsolutePath(
    absolutePath: string
  ): Promise<string> {
    const stat = await fs.stat(absolutePath, { bigint: true });
    return computeHash(stat.ino.toString());
  }

  /**
   *  Returns directory of a certain absolute path.
   *  @param absolutePath
   *  @returns directory or null
   */
  public async getDirectoryByAbsolutePath(
    absolutePath: string
  ): Promise<DirectoryEntity | null> {
    const hash = await this.getDirectoryHashByAbsolutePath(absolutePath);

    return this.getDirectoryByHash(hash);
  }

  public async getDirectoriesIn(
    directory: DirectoryEntity
  ): Promise<DirectoryEntity[]> {
    return this.directoryRepository.findBy({
      parent: {
        uuid: directory.uuid,
      },
    });
  }

  /**
   *  Returns ancestors of the directory.
   *  @param directory
   *  @returns ancestors
   */
  public getAncestorsDirectory(
    directory: DirectoryEntity
  ): Promise<DirectoryEntity[]> {
    return this.directoryRepository.findAncestors(directory);
  }

  /**
   *
   * @param directory
   * @returns
   */
  private saveDirectory(directory: DirectoryEntity): Promise<DirectoryEntity> {
    return this.directoryRepository.save(directory);
  }

  /**
   *
   * @param directories
   * @returns
   */
  private saveDirectories(
    directories: DirectoryEntity[]
  ): Promise<DirectoryEntity[]> {
    return this.directoryRepository.save(directories);
  }

  /**
   *
   * @param directory
   * @param destDirectory
   * @returns
   */
  public async createDirectory(
    directory: DirectoryEntity,
    destDirectory: DirectoryEntity | null = null
  ) {
    const cloneDirectory = directory.clone();
    cloneDirectory.parent = destDirectory;

    const newDirectory = await this.saveDirectory(cloneDirectory);

    /** TODO: Check name exists */

    return newDirectory;
  }

  /**
   *
   * @param directory
   * @param destDirectory
   * @returns
   */
  public async renameDirectory(directory: DirectoryEntity, name: string) {
    const updatedDirectory = await this.saveDirectory({
      ...directory,
      name,
    });

    /** TODO: Check name exists */

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
  ) {
    await this.updateEntitySize(directory, "decrease");

    const updatedDirectory = await this.saveDirectory({
      ...directory,
      parent: destDirectory,
    });

    /** TODO: Check name exists */

    await this.updateEntitySize(updatedDirectory, "increase");

    return updatedDirectory;
  }

  /**
   *
   * @param uuid
   */
  public async deleteDirectoryByUuid(uuid: string) {
    const foundDirectory = await this.getDirectoryByUuid(uuid);

    if (!foundDirectory)
      throw new Error(`The directory was not found: ${uuid}`);

    await this.updateEntitySize(foundDirectory, "decrease");

    await this.directoryRepository.delete({
      uuid,
    });

    return foundDirectory;
  }

  /**
   *
   * @param entity
   * @param kind
   * @returns
   */
  public async updateEntitySize(
    entity: FileEntity | DirectoryEntity,
    kind: "increase" | "decrease"
  ) {
    let directory: DirectoryEntity | null = null;

    if (entity instanceof FileEntity) {
      /** in the root  */
      if (!entity.directoryUuid) return;

      directory = await this.getDirectoryByUuid(entity.directoryUuid);

      if (!directory)
        throw new Error(`The directory was not found: ${entity.directoryUuid}`);
    } else if (entity instanceof DirectoryEntity) {
      /** in the root  */
      if (!entity.parent) return;

      directory = entity;
    } else {
      throw new Error(
        `The given entity is not FileEntity or DirectoryEntity: ${typeof entity}`
      );
    }

    const ancestors = await this.getAncestorsDirectory(directory);

    for (const ancestor of ancestors) {
      if (kind === "increase") {
        ancestor.size += entity.size;
      } else if (kind === "decrease") {
        ancestor.size -= entity.size;
      }
    }

    await this.saveDirectories(ancestors);
  }

  public async getAbsolutePathByEntity(
    entity: FileEntity | DirectoryEntity
  ): Promise<string> {
    const absoluteRootPath = this.config.getAbsoluteRootPath();
    let directory: DirectoryEntity | null = null;

    if (entity instanceof FileEntity) {
      /** in the root  */
      if (!entity.directoryUuid) return absoluteRootPath;

      directory = await this.getDirectoryByUuid(entity.directoryUuid);

      if (!directory)
        throw new Error(`The directory was not found: ${entity.directoryUuid}`);
    } else if (entity instanceof DirectoryEntity) {
      /** in the root  */
      if (!entity.parent) return absoluteRootPath;

      directory = entity;
    } else {
      throw new Error(
        `The given entity is not FileEntity or DirectoryEntity: ${typeof entity}`
      );
    }

    const ancestors = await this.getAncestorsDirectory(directory);

    return join(
      absoluteRootPath,
      [
        ...ancestors.map(a => a.name),
        directory.name,
        entity instanceof FileEntity && entity.name,
      ].join("/")
    );
  }
}
