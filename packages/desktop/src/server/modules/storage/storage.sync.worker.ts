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
  async link(job: Job<StorageSyncWorkerCtx>): Promise<FileEntity> {
    const { absolutePath } = job.data;

    const isFileExists = Boolean(
      await this.storageManager.findOneFileByAbsolutePath(absolutePath)
    );

    if (isFileExists)
      throw new Error(`The file already exists: ${absolutePath}`);

    const absoluteRootPath = await this.config.getRootPath();

    const fileInfo = await getFileStat(absolutePath);

    if (!fileInfo) throw new Error(`Failed to get file info: ${absolutePath}`);

    const file = new FileEntity();
    file.name = fileInfo.name;
    file.size = fileInfo.size;
    file.absolutePath = absolutePath;
    file.relativePath = file.absolutePath.replace(absoluteRootPath, "");

    if (fileInfo.absoluteDirPath === absoluteRootPath) {
      return await this.storageManager.saveFile(file);
    }

    const parentDirectory =
      await this.storageManager.getDirectoryByAbsolutePath(
        fileInfo.absoluteDirPath
      );

    file.parentDirectory = parentDirectory;
    file.parentDirectoryUUID = parentDirectory.uuid;

    return await this.storageManager.saveFile(file);
  }

  @Process("unlink")
  async unlink(job: Job<StorageSyncWorkerCtx>): Promise<FileEntity> {
    const { absolutePath } = job.data;

    const file = await this.storageManager.findOneFileByAbsolutePath(
      absolutePath
    );

    if (!file) throw new Error(`The file was not found: ${absolutePath}`);

    await this.storageManager.deleteFileByUuid(file.uuid);

    let currentDirectoryUUID = file.parentDirectoryUUID;

    while (currentDirectoryUUID) {
      const directory = await this.storageManager.findOneDirectoryByUuid(
        currentDirectoryUUID
      );

      if (!directory)
        throw new Error(`The directory was not found: ${currentDirectoryUUID}`);

      directory.size -= file.size;

      if (directory.size === 0)
        await this.storageManager.deleteDirectoryByUuid(directory.uuid);
      else await this.storageManager.saveDirectory(directory);

      currentDirectoryUUID = directory.parentDirectoryUUID;
    }

    return file;
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

  @OnJobCompleted("link")
  onLinkJobCompleted(_job: Job<StorageSyncWorkerCtx>, result: FileEntity) {
    this.gateway.sendMessage(StorageGatewayEventsEnum.ON_NEW_ENTITY_DETECTED, {
      file: result,
    });
  }

  @OnJobFailed()
  onJobFailed(_job: Job<StorageSyncWorkerCtx>) {
    this.logger.error("The sync is failed.", StorageSyncWorker.name);
  }
}
