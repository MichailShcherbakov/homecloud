import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { FileEntity } from "@/server/db/entities/file.entity";
import { getFileStat } from "@/server/utils/getFileStat";
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
import { basename, dirname } from "path";
import { Logger } from "@nestjs/common";
import { StorageGateway } from "./storage.gateway";
import { StorageGatewayEventsEnum } from "./storage.events";

export interface StorageSyncWorkerCtx {
  absolutePath: string;
}

@Processor("sync")
export class StorageSyncWorker {
  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigService,
    private readonly storageManager: StorageManager,
    private readonly gateway: StorageGateway
  ) {}

  @Process("link")
  async link(job: Job<StorageSyncWorkerCtx>): Promise<FileEntity | undefined> {
    const { absolutePath } = job.data;

    const absoluteRootPath = await this.config.getRootPath();

    const fileInfo = await getFileStat(absolutePath);

    if (!fileInfo) return;

    const file = new FileEntity();
    file.name = fileInfo.name;
    file.size = fileInfo.size;
    file.absolutePath = absolutePath;
    file.relativePath = file.absolutePath.replace(absoluteRootPath, "");

    if (fileInfo.absoluteDirPath === absoluteRootPath) {
      await this.storageManager.saveFile(file);
      return;
    }

    const parentDirectory = await this.getDirectory(fileInfo.absoluteDirPath);

    file.parentDirectory = parentDirectory;
    file.parentDirectoryUUID = parentDirectory.uuid;

    const fileEntity = await this.storageManager.saveFile(file);

    let currentDirectoryUUID: string | undefined = file.parentDirectoryUUID;

    while (currentDirectoryUUID) {
      const directory: DirectoryEntity | null =
        await this.storageManager.findOneDirectoryByUuid(currentDirectoryUUID);

      if (!directory) return;

      directory.size += file.size;

      await this.storageManager.saveDirectory(directory);

      currentDirectoryUUID = directory.parentDirectoryUUID;
    }

    return fileEntity;
  }

  @Process("unlink")
  async unlink(
    job: Job<StorageSyncWorkerCtx>
  ): Promise<FileEntity | undefined> {
    const { absolutePath } = job.data;

    const file = await this.storageManager.findOneFileByAbsolutePath(
      absolutePath
    );

    if (!file) return;

    await this.storageManager.deleteFileByUuid(file.uuid);

    let currentDirectoryUUID = file.parentDirectoryUUID;

    while (currentDirectoryUUID) {
      const directory = await this.storageManager.findOneDirectoryByUuid(
        currentDirectoryUUID
      );

      if (!directory) return;

      directory.size -= file.size;

      if (directory.size === 0)
        await this.storageManager.deleteDirectoryByUuid(directory.uuid);
      else await this.storageManager.saveDirectory(directory);

      currentDirectoryUUID = directory.parentDirectoryUUID;
    }

    return file;
  }

  private async getDirectory(absoluteDirPath: string) {
    const directory = await this.storageManager.findOneDirectoryByAbsolutePath(
      absoluteDirPath
    );

    if (directory) return directory;

    const absoluteRootPath = await this.config.getRootPath();

    const dir = new DirectoryEntity();

    dir.name = basename(absoluteDirPath);
    dir.size = 0;
    dir.absolutePath = absoluteDirPath;
    dir.relativePath = dir.absolutePath.replace(absoluteRootPath, "");

    const parentDirectoryPath = dirname(dir.absolutePath);
    const parentDirectory =
      await this.storageManager.findOneDirectoryByAbsolutePath(
        parentDirectoryPath
      );

    if (parentDirectory) {
      dir.parentDirectoryUUID = parentDirectory.uuid;

      await this.storageManager.saveDirectory(parentDirectory);
    } else if (parentDirectoryPath !== absoluteRootPath) {
      const parentDirectory = await this.getDirectory(parentDirectoryPath);

      dir.parentDirectoryUUID = parentDirectory.uuid;
    }

    return this.storageManager.saveDirectory(dir);
  }

  @OnJobActive()
  onJobActive(job: Job<StorageSyncWorkerCtx>) {
    this.logger.log("Start of sync", StorageSyncWorker.name);
  }

  @OnJobProgress()
  onJobProgress(job: Job<StorageSyncWorkerCtx>, progress: number) {
    this.logger.log(`Processing..: ${progress}%`, StorageSyncWorker.name);
  }

  @OnJobCompleted()
  onJobCompleted(job: Job<StorageSyncWorkerCtx>) {
    this.logger.log("The sync is done.", StorageSyncWorker.name);
  }

  @OnJobCompleted("link")
  onLinkJobCompleted(
    job: Job<StorageSyncWorkerCtx>,
    result: FileEntity | undefined
  ) {
    this.gateway.sendMessage(StorageGatewayEventsEnum.ON_NEW_ENTITY_DETECTED, {
      file: result,
    });
  }

  @OnJobFailed()
  onJobFailed(job: Job<StorageSyncWorkerCtx>) {
    this.logger.error("The sync is failed.", StorageSyncWorker.name);
  }
}
