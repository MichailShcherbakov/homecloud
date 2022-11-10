import { FileEntity } from "@/server/db/entities/file.entity";
import { computeFileHash } from "@/server/utils/fs";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { ConfigService } from "../config/config.service";
import { DirectoryService } from "./directory.service";
import { join } from "path";
import { DirectoryEntity } from "@/server/db/entities/directory.entity";

/**
 * @private
 */
@Injectable()
export class FileService {
  constructor(
    private readonly config: ConfigService,
    private readonly directoryService: DirectoryService,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>
  ) {}

  /**
   *  @param
   *  @returns count
   */
  public getFilesCount(): Promise<number> {
    return this.fileRepository.count();
  }

  /**
   *
   * @returns
   */
  public getRootFiles(): Promise<FileEntity[]> {
    return this.fileRepository.findBy({
      directoryUuid: IsNull(),
    });
  }

  /**
   *
   * @param directory
   * @returns
   */
  public getFilesIn(directory: DirectoryEntity): Promise<FileEntity[]> {
    return this.fileRepository.findBy({
      directoryUuid: directory.uuid,
    });
  }

  /**
   *  Returns files of a certain hashsum.
   *  @param hash
   *  @returns Array of the files
   */
  public getFilesByHash(hash: string): Promise<FileEntity[]> {
    return this.fileRepository.findBy({
      hash,
    });
  }

  /**
   *  Returns files of a certain uuid.
   *  @param uuid
   *  @returns Array of the files
   */
  public getFileByUuid(uuid: string): Promise<FileEntity | null> {
    return this.fileRepository.findOneBy({
      uuid,
    });
  }

  /**
   *  Returns files of a certain uuid.
   *  @param uuid
   *  @returns Array of the files
   */
  public async getFileByAbsolutePath(
    absolutePath: string
  ): Promise<FileEntity | null> {
    const absoluteRootPath = this.config.getAbsoluteRootPath();
    const hash = await computeFileHash(absolutePath);

    const foundFiles = await this.getFilesByHash(hash);

    const files = await Promise.all(
      foundFiles.map(async file => {
        if (!file.directoryUuid) {
          if (absolutePath === absoluteRootPath) return file;

          return null;
        }

        const directory = await this.directoryService.getDirectoryByUuid(
          file.directoryUuid
        );

        if (!directory) return null;

        const ancestors = await this.directoryService.getAncestorsDirectory(
          directory
        );

        const relativeFilePath = [
          ...ancestors.map(a => a.name),
          directory.name,
          file.name,
        ].join("/");
        const absoluteFilePath = join(absoluteRootPath, relativeFilePath);

        if (absoluteFilePath !== absolutePath) return null;

        return file;
      })
    );

    return files.find(file => !!file) ?? null;
  }

  /**
   * @param file
   * @returns new file
   */
  private saveFile(file: FileEntity): Promise<FileEntity> {
    return this.fileRepository.save(file);
  }

  /**
   * @param file
   * @returns
   */
  public async createFile(
    file: FileEntity,
    destDirectory: DirectoryEntity | null = null
  ) {
    const newFile = await this.saveFile({
      ...file,
      directory: destDirectory ?? undefined,
      directoryUuid: destDirectory?.uuid,
    });

    await this.directoryService.updateEntitySize(newFile, "increase");

    /** TODO: Check name exists */

    return newFile;
  }

  /**
   * @param file
   * @param name
   * @returns
   */
  public async renameFile(file: FileEntity, name: string) {
    const updatedFile = await this.saveFile({ ...file, name });

    /** TODO: Check name exists */

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
  ) {
    await this.directoryService.updateEntitySize(file, "decrease");

    const updatedFile = await this.saveFile({
      ...file,
      directory: destDirectory ?? undefined,
      directoryUuid: destDirectory?.uuid,
    });

    /** TODO: Check name exists */

    await this.directoryService.updateEntitySize(updatedFile, "increase");

    return updatedFile;
  }

  /**
   * @param file
   * @returns the deleted file
   */
  public async deleteFileByUuid(uuid: string): Promise<FileEntity> {
    const foundFile = await this.getFileByUuid(uuid);

    if (!foundFile) throw new Error(`The file was not found: ${uuid}`);

    await this.directoryService.updateEntitySize(foundFile, "decrease");

    await this.fileRepository.delete({
      uuid,
    });

    return foundFile;
  }
}
