import { FileEntity } from "@/server/db/entities/file.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { DirectoryEntity } from "@/server/db/entities/directory.entity";

/**
 * @private
 */
@Injectable()
export class FileService {
  constructor(
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
   *  Returns file of a certain uuid.
   *  @param uuid
   *  @returns file
   */
  public getFileByUuid(uuid: string): Promise<FileEntity | null> {
    return this.fileRepository.findOneBy({
      uuid,
    });
  }

  /**
   *  Returns file of a certain uuid. Throw an error when a file was not found
   *  @param uuid
   *  @returns file
   */
  public async getFileByUuidOrFail(uuid: string): Promise<FileEntity> {
    const file = await this.getFileByUuid(uuid);

    if (!file) throw new Error(`The file was not found: ${uuid}`);

    return file;
  }

  /**
   *  Returns file of a certain relative path.
   *  @param relativePath
   *  @returns file
   */
  public async getFileByRelativePath(
    relativePath: string
  ): Promise<FileEntity | null> {
    return this.fileRepository.findOneBy({
      relativePath,
    });
  }

  /**
   *  Returns file of a certain relative path. Throw an error when a file was not found
   *  @param relativePath
   *  @returns file
   */
  public async getFileByRelativePathOrFail(
    relativePath: string
  ): Promise<FileEntity> {
    const file = await this.getFileByUuid(relativePath);

    if (!file) throw new Error(`The file was not found: ${relativePath}`);

    return file;
  }

  /**
   * @param file
   * @returns file
   */
  public saveFile(file: FileEntity): Promise<FileEntity> {
    return this.fileRepository.save(file);
  }

  /**
   * @param uuid
   */
  public async deleteFileByUuid(uuid: string): Promise<void> {
    await this.fileRepository.delete({
      uuid,
    });
  }
}
