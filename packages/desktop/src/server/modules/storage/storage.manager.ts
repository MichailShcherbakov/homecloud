import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { FileEntity } from "@/server/db/entities/file.entity";
import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ConfigService } from "../config/config.service";
import { StorageEventEnum } from "./storage.events";
import { FileService } from "./file.service";
import { DirectoryService } from "./directory.service";

@Injectable()
export class StorageManager {
  constructor(
    private readonly config: ConfigService,
    private readonly emitter: EventEmitter2,
    private readonly fileService: FileService,
    private readonly directoryService: DirectoryService
  ) {}

  /**
   * @param
   * @returns
   */
  public getRootDirectories() {
    return this.directoryService.getRootDirectories();
  }

  /**
   * @param
   * @returns
   */
  public getDirectoriesCount() {
    return this.directoryService.getDirectoriesCount();
  }

  /**
   * @param uuid
   * @returns
   */
  public getDirectoryByUuid(uuid: string) {
    return this.directoryService.getDirectoryByUuid(uuid);
  }

  /**
   * @param absolutePath
   * @returns
   */
  public async getDirectoryByAbsolutePath(absolutePath: string) {
    return this.directoryService.getDirectoryByAbsolutePath(absolutePath);
  }

  /**
   * @param directory
   * @returns
   */
  public getDirectoriesIn(directory: DirectoryEntity) {
    return this.directoryService.getDirectoriesIn(directory);
  }

  /**
   * @param directory
   * @returns
   */
  public getAncestorsDirectory(directory: DirectoryEntity) {
    return this.directoryService.getAncestorsDirectory(directory);
  }

  /**
   * @param directory
   * @returns
   */
  public async createDirectory(
    directory: DirectoryEntity,
    destDirectory: DirectoryEntity | null = null
  ) {
    const newDirectory = await this.directoryService.createDirectory(
      directory,
      destDirectory
    );

    this.emitter.emit(StorageEventEnum.ON_DIR_ADDED, newDirectory);

    return newDirectory;
  }

  /**
   * @param directory
   * @param name
   * @returns
   */
  public async renameDirectory(directory: DirectoryEntity, name: string) {
    const updatedDirectory = await this.directoryService.renameDirectory(
      directory,
      name
    );

    this.emitter.emit(
      StorageEventEnum.ON_DIR_RENAMED,
      updatedDirectory,
      directory
    );

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
    const updatedDirectory = await this.directoryService.moveDirectory(
      directory,
      destDirectory
    );

    this.emitter.emit(
      StorageEventEnum.ON_DIR_MOVED,
      updatedDirectory,
      directory
    );

    return updatedDirectory;
  }

  /**
   *
   * @param uuid
   */
  public async deleteDirectoryByUuid(uuid: string) {
    const deletedDirectory = await this.directoryService.deleteDirectoryByUuid(
      uuid
    );

    this.emitter.emit(StorageEventEnum.ON_DIR_REMOVED, deletedDirectory);

    return deletedDirectory;
  }

  /**
   * @param
   * @returns
   */
  public getFilesCount() {
    return this.fileService.getFilesCount();
  }

  /**
   * @param
   * @returns
   */
  public getRootFiles() {
    return this.fileService.getRootFiles();
  }

  /**
   * @param uuid
   * @returns
   */
  public getFileByUuid(uuid: string) {
    return this.fileService.getFileByUuid(uuid);
  }

  /**
   * @param absolutePath
   * @returns
   */
  public async getFileByAbsolutePath(absolutePath: string) {
    return this.fileService.getFileByAbsolutePath(absolutePath);
  }

  /**
   * @param directory
   * @returns
   */
  public getFilesIn(directory: DirectoryEntity) {
    return this.fileService.getFilesIn(directory);
  }

  /**
   * @param file
   * @returns
   */
  public async createFile(
    file: FileEntity,
    destDirectory: DirectoryEntity | null = null
  ) {
    const newFile = await this.fileService.createFile(file, destDirectory);

    this.emitter.emit(StorageEventEnum.ON_FILE_ADDED, newFile);

    return newFile;
  }

  /**
   * @param file
   * @param name
   * @returns
   */
  public async renameFile(file: FileEntity, name: string) {
    const updatedFile = await this.fileService.renameFile(file, name);

    this.emitter.emit(StorageEventEnum.ON_FILE_RENAMED, updatedFile, file);

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
    const updatedFile = await this.fileService.moveFile(file, destDirectory);

    this.emitter.emit(StorageEventEnum.ON_FILE_MOVED, updatedFile, file);

    return updatedFile;
  }

  /**
   * @param uuid
   * @returns
   */
  public async deleteFileByUuid(uuid: string) {
    const deletedFile = await this.fileService.deleteFileByUuid(uuid);

    this.emitter.emit(StorageEventEnum.ON_DIR_REMOVED, deletedFile);

    return deletedFile;
  }
}
