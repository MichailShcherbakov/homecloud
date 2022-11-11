import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { path } from "@ffmpeg-installer/ffmpeg";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Like, TreeRepository } from "typeorm";
import { ConfigService } from "../config/config.service";
import { sep } from "path";

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
   *  @returns count
   */
  public getDirectoriesCount(): Promise<number> {
    return this.directoryRepository.count();
  }

  /**
   * @returns directories
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
   *  Returns directory of a certain uuid. Throw an error when a directory was not found.
   *  @param uuid
   *  @returns directory
   */
  public async getDirectoryByUuidOrFail(
    uuid: string
  ): Promise<DirectoryEntity> {
    const directory = await this.getDirectoryByUuid(uuid);

    if (!directory) throw new Error(`The directory was not found: ${uuid}`);

    return directory;
  }

  /**
   *  @param relativePath
   *  @returns directory
   */
  public getDirectoryByRelativePath(
    relativePath: string
  ): Promise<DirectoryEntity | null> {
    return this.directoryRepository.findOneBy({
      relativePath,
    });
  }

  /**
   *  @param relativePath
   *  @returns directory
   */
  public async getDirectoryByRelativePathOrFail(
    relativePath: string
  ): Promise<DirectoryEntity> {
    const directory = await this.getDirectoryByRelativePath(relativePath);

    if (!directory)
      throw new Error(`The directory was not found: ${relativePath}`);

    return directory;
  }

  /**
   * @param directory
   * @returns
   */
  public async getDirectoriesIn(
    directory: DirectoryEntity
  ): Promise<DirectoryEntity[]> {
    return this.directoryRepository.findBy({
      parentUuid: directory.uuid,
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
   *  Returns descendants of the directory by path.
   *  @param relativePath
   *  @returns descendants
   */
  public getDescendantsByPath(
    relativePath: string
  ): Promise<DirectoryEntity[]> {
    return this.directoryRepository.findBy({
      relativePath: Like(`${relativePath}${sep}%`),
    });
  }

  /**
   * @param directory
   * @returns The created directory
   */
  public saveDirectory(directory: DirectoryEntity): Promise<DirectoryEntity> {
    return this.directoryRepository.save(directory);
  }

  /**
   * @param directories
   * @returns The created directories
   */
  public saveDirectories(
    directories: DirectoryEntity[]
  ): Promise<DirectoryEntity[]> {
    return this.directoryRepository.save(directories);
  }

  /**
   * @param uuid
   */
  public async deleteDirectoryByUuid(uuid: string): Promise<void> {
    await this.directoryRepository.delete({
      uuid,
    });
  }
}
