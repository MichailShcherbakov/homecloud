import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { FileEntity } from "@/server/db/entities/file.entity";
import { getFileInfo } from "@/server/utils/getFileInfo";
import { ConfigService } from "../config/config.service";
import {
  Job,
  OnJobActive,
  OnJobCompleted,
  OnJobFailed,
  OnJobProgress,
  Process,
  Processor,
} from "../queue";
import { StorageManager } from "./storage.manager";
import { Logger } from "@nestjs/common";
import { StorageGateway } from "./storage.gateway";
import { StorageGatewayEventsEnum } from "./storage.events";
import { parse } from "path";

export enum SyncWorkerProcessEnum {
  ADD_FILE = "ADD_FILE",
  REMOVE_FILE = "REMOVE_FILE",
  ADD_DIR = "ADD_DIR",
  REMOVE_DIR = "REMOVE_DIR",
}

export interface StorageSyncWorkerCtx {
  absolutePath: string;
}

@Processor("sync")
export class StorageSyncWorker {
  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigService,
    private readonly storageManager: StorageManager
  ) {}

  @Process(SyncWorkerProcessEnum.ADD_FILE)
  async addFile(job: Job<StorageSyncWorkerCtx>): Promise<FileEntity> {
    const { absolutePath } = job.data;

    const absoluteRootPath = await this.config.getAbsoluteRootPath();

    const fileInfo = await getFileInfo(absolutePath);

    if (!fileInfo) throw new Error(`Failed to get file info: ${absolutePath}`);

    const file = new FileEntity();
    file.name = fileInfo.name;
    file.size = fileInfo.size;
    file.absolutePath = absolutePath;
    file.relativePath = file.absolutePath.replace(absoluteRootPath, "");

    if (fileInfo.absoluteDirPath === absoluteRootPath) {
      return this.storageManager.saveFile(file);
    }

    const parentDirectory =
      await this.storageManager.getDirectoryByAbsolutePath(
        fileInfo.absoluteDirPath
      );

    if (!parentDirectory)
      throw new Error(
        `The parent directory was not found: ${fileInfo.absoluteDirPath}`
      );

    file.parentDirectory = parentDirectory;
    file.parentDirectoryUUID = parentDirectory.uuid;

    return this.storageManager.saveFile(file);
  }

  @Process(SyncWorkerProcessEnum.REMOVE_FILE)
  async removeFile(job: Job<StorageSyncWorkerCtx>): Promise<FileEntity> {
    const { absolutePath } = job.data;

    const file = await this.storageManager.getFileByAbsolutePath(absolutePath);

    if (!file) throw new Error(`The file was not found: ${absolutePath}`);

    await this.storageManager.deleteFileByUuid(file.uuid);

    return file;
  }

  @Process(SyncWorkerProcessEnum.ADD_DIR)
  async addDir(job: Job<StorageSyncWorkerCtx>): Promise<FileEntity> {
    const { absolutePath } = job.data;

    const isDirExists = !!(await this.storageManager.getDirectoryByAbsolutePath(
      absolutePath
    ));

    if (isDirExists)
      throw new Error(`The directory already exists: ${absolutePath}`);

    const absoluteRootPath = await this.config.getAbsoluteRootPath();

    const dirInfo = parse(absolutePath);

    const dir = new DirectoryEntity();
    dir.name = dirInfo.name;
    dir.size = 0;
    dir.absolutePath = absolutePath;
    dir.relativePath = dir.absolutePath.replace(absoluteRootPath, "");

    if (dirInfo.dir === absoluteRootPath) {
      return this.storageManager.saveDirectory(dir);
    }

    const parentDirectory =
      await this.storageManager.getDirectoryByAbsolutePath(dirInfo.dir);

    if (!parentDirectory)
      throw new Error(`The parent directory was not found: ${dirInfo.dir}`);

    dir.parentDirectory = parentDirectory;
    dir.parentDirectoryUUID = parentDirectory.uuid;

    return this.storageManager.saveDirectory(dir);
  }

  @Process(SyncWorkerProcessEnum.REMOVE_DIR)
  async removeDir(job: Job<StorageSyncWorkerCtx>): Promise<FileEntity> {
    const { absolutePath } = job.data;

    const dir = await this.storageManager.getDirectoryByAbsolutePath(
      absolutePath
    );

    if (!dir) throw new Error(`The directory was not found: ${absolutePath}`);

    await this.storageManager.deleteDirectoryByUuid(dir.uuid);

    return dir;
  }

  @OnJobActive()
  onJobActive(_job: Job<StorageSyncWorkerCtx>) {
    this.logger.log("Start of sync", StorageSyncWorker.name);
  }

  @OnJobProgress()
  onJobProgress(_job: Job<StorageSyncWorkerCtx>, progress: number) {
    this.logger.log(`Processing..: ${progress}%`, StorageSyncWorker.name);
  }

  @OnJobCompleted()
  onJobCompleted(_job: Job<StorageSyncWorkerCtx>) {
    this.logger.log("The sync is done.", StorageSyncWorker.name);
  }

  @OnJobFailed()
  onJobFailed(_job: Job<StorageSyncWorkerCtx>) {
    this.logger.error("The sync is failed.", StorageSyncWorker.name);
  }
}
