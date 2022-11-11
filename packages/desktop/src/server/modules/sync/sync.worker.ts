import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { FileEntity } from "@/server/db/entities/file.entity";
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
import { Logger } from "@nestjs/common";
import { SyncWorkerProcessEnum, SYNC_QUEUE_NAME } from "./constants";
import { computeFileHash } from "@/server/utils/fs/computeFileHash";
import { FileSystemService } from "../file-system/file-system.service";
import { toJSON } from "@/server/utils/format";
import { MetadataEntity } from "@/server/db/entities/metadata.entity";
import { StorageManager } from "../storage/storage.manager";
import { ROOT_RELATIVE_PATH } from "../config/config.constants";
import { ReferenceService } from "../storage/reference.service";
import { IEntityInfo } from "@/server/utils/getFileInfo";

export interface ISyncWorkerProcessData {
  kind: string;
}

export interface SyncWorkerProcessDataFromFS extends ISyncWorkerProcessData {
  kind: "fs";

  metadata: Omit<MetadataEntity, "getInfo">;
  metadataInfo: IEntityInfo;

  toAbsolutePath: string;
  fromAbsolutePath?: string;
}

export interface SyncWorkerProcessDataFromStorage<
  TEntity = FileEntity | DirectoryEntity
> extends ISyncWorkerProcessData {
  kind: "storage";
  entity: TEntity;
  oldEntity?: TEntity;
}

export type SyncWorkerProcessData<TEntity = FileEntity | DirectoryEntity> =
  | SyncWorkerProcessDataFromFS
  | SyncWorkerProcessDataFromStorage<TEntity>;

@Processor(SYNC_QUEUE_NAME)
export class SyncWorker {
  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigService,
    private readonly storage: StorageManager,
    private readonly referenceService: ReferenceService,
    private readonly fs: FileSystemService
  ) {}

  @Process(SyncWorkerProcessEnum.ADD_FILE)
  async addFile(
    job: Job<SyncWorkerProcessData<FileEntity>>
  ): Promise<FileEntity> {
    const { data } = job;

    if (data.kind === "storage") {
      const { entity: file } = data;

      const absoluteRootPath = this.config.getAbsoluteRootPath();

      const absoluteTempPath = this.fs.join(
        this.config.getAbsoluteTempPath(),
        file.uuid
      );

      let absoluteDestPath = absoluteRootPath;

      if (file.directoryUuid) {
        const directory = await this.storage.getDirectoryByUuidOrFail(
          file.directoryUuid
        );

        absoluteDestPath = this.fs.join(
          absoluteRootPath,
          directory.relativePath
        );
      }

      await this.fs.mv(absoluteTempPath, absoluteDestPath);

      return file;
    }

    if (data.kind === "fs") {
      const { metadata, metadataInfo } = data;

      const relativePath = this.config.getRelativePathBy(
        metadataInfo.absoluteDirectoryPath
      );

      const newFile = new FileEntity();
      newFile.name = metadataInfo.name;
      newFile.hash = await computeFileHash(metadata.path);
      newFile.size = metadataInfo.size;

      if (relativePath === ROOT_RELATIVE_PATH) {
        return this.storage.createFile(newFile);
      }

      const destDirectory = await this.storage.getDirectoryByRelativePathOrFail(
        relativePath
      );

      return this.storage.createFile(newFile, destDirectory);
    }

    throw new Error(`Unknown kind: ${toJSON(data)}`);
  }

  @Process(SyncWorkerProcessEnum.REMOVE_FILE)
  async removeFile(
    job: Job<SyncWorkerProcessData<FileEntity>>
  ): Promise<FileEntity | null> {
    const { data } = job;

    if (data.kind === "storage") {
      const { entity: file } = data;

      const absolutePath = this.config.getAbsolutePathByOrFail(
        file.relativePath
      );

      await this.fs.rm(absolutePath, {
        recursive: true,
        force: true,
      });

      return file;
    }

    if (data.kind === "fs") {
      const { metadata } = data;

      const fileRef = await this.referenceService.getRefByMetadataOrFail(
        metadata as MetadataEntity
      );

      if (!fileRef.file)
        throw new Error(`The file was not found: ${fileRef.fileUuid}`);

      await this.storage.deleteFileByUuid(fileRef.file.uuid);

      return fileRef.file;
    }

    throw new Error(`Unknown kind`);
  }

  @Process(SyncWorkerProcessEnum.ADD_DIR)
  async addDir(
    job: Job<SyncWorkerProcessData<DirectoryEntity>>
  ): Promise<DirectoryEntity> {
    const { data } = job;

    if (data.kind === "storage") {
      const { entity: directory } = data;

      const absolutePath = this.fs.join(
        this.config.getAbsoluteRootPath(),
        directory.relativePath
      );

      await this.fs.mkdir(absolutePath);

      return directory;
    }

    if (data.kind === "fs") {
      const { metadata, metadataInfo } = data;

      const relativePath = this.config.getRelativePathBy(
        metadataInfo.absoluteDirectoryPath
      );

      const newDirectory = new DirectoryEntity();
      newDirectory.name = metadataInfo.name;
      newDirectory.size = metadataInfo.size;

      if (relativePath === ROOT_RELATIVE_PATH) {
        const directory = await this.storage.createDirectory(newDirectory);

        await this.referenceService.createRef(
          directory,
          metadata as MetadataEntity
        );

        return directory;
      }

      const parentDirectory =
        await this.storage.getDirectoryByRelativePathOrFail(relativePath);

      const directory = await this.storage.createDirectory(
        newDirectory,
        parentDirectory
      );

      await this.referenceService.createRef(
        directory,
        metadata as MetadataEntity
      );
    }

    throw new Error(`Unknown kind`);
  }

  @Process(SyncWorkerProcessEnum.RENAME_DIR)
  async renameDir(
    job: Job<SyncWorkerProcessData<DirectoryEntity>>
  ): Promise<DirectoryEntity> {
    const { data } = job;

    if (data.kind === "storage") {
      const { entity: directory, oldEntity: oldDirectory } = data;

      if (!oldDirectory) throw new Error(`The old directory is undefined`);

      const newAbsolutePath = this.fs.join(
        this.config.getAbsoluteRootPath(),
        directory.relativePath
      );

      const oldAbsolutePath = this.config.getAbsolutePathByOrFail(
        oldDirectory.relativePath
      );

      await this.fs.rename(oldAbsolutePath, newAbsolutePath);

      return directory;
    }

    if (data.kind === "fs") {
      const { metadata, metadataInfo } = data;

      const { directory } = await this.referenceService.getRefByMetadataOrFail(
        metadata as MetadataEntity
      );

      if (!directory)
        throw new Error(`The directory was not found: ${toJSON(metadata)}`);

      return this.storage.renameDirectory(directory, metadataInfo.name);
    }

    throw new Error(`Unknown kind`);
  }

  @Process(SyncWorkerProcessEnum.MOVE_DIR)
  async moveDir(
    job: Job<SyncWorkerProcessData<DirectoryEntity>>
  ): Promise<DirectoryEntity> {
    const { data } = job;

    if (data.kind === "storage") {
      const { entity: directory, oldEntity: oldDirectory } = data;

      if (!oldDirectory) throw new Error(`The old directory is undefined`);

      const newAbsolutePath = this.fs.join(
        this.config.getAbsoluteRootPath(),
        directory.relativePath
      );

      const oldAbsolutePath = this.config.getAbsolutePathByOrFail(
        oldDirectory.relativePath
      );

      await this.fs.rename(oldAbsolutePath, newAbsolutePath);

      return directory;
    }

    if (data.kind === "fs") {
      const { metadata, metadataInfo } = data;

      const destDirectoryRelativePath = this.config.getRelativePathBy(
        metadataInfo.absoluteDirectoryPath
      );

      const { directory } = await this.referenceService.getRefByMetadataOrFail(
        metadata as MetadataEntity
      );

      if (!directory)
        throw new Error(`The directory was not found: ${toJSON(metadata)}`);

      if (destDirectoryRelativePath === ROOT_RELATIVE_PATH) {
        return this.storage.moveDirectory(directory);
      }

      const destDirectory = await this.storage.getDirectoryByRelativePathOrFail(
        destDirectoryRelativePath
      );

      return this.storage.moveDirectory(directory, destDirectory);
    }

    throw new Error(`Unknown kind`);
  }

  @Process(SyncWorkerProcessEnum.REMOVE_DIR)
  async removeDir(
    job: Job<SyncWorkerProcessData<DirectoryEntity>>
  ): Promise<DirectoryEntity | null> {
    const { data } = job;

    if (data.kind === "storage") {
      const { entity: directory } = data;

      const absolutePath = await this.config.getAbsolutePathByOrFail(
        directory.relativePath
      );

      await this.fs.rm(absolutePath, {
        recursive: true,
        force: true,
      });

      return directory;
    }

    if (data.kind === "fs") {
      const { metadata } = data;

      const directoryRef = await this.referenceService.getRefByMetadata(
        metadata as MetadataEntity
      );

      // In the file system, root directory delete firstly, and then it's descendants,
      // so it's normal that some directory will not to be found
      if (!directoryRef?.directory?.uuid) return null;

      await this.storage.deleteDirectoryByUuid(directoryRef.directory.uuid);

      return directoryRef.directory;
    }

    throw new Error(`Unknown kind`);
  }

  @OnJobActive()
  onJobActive(_job: Job<SyncWorkerProcessData>) {
    this.logger.log(
      `Start of sync: ${_job.processName} ${toJSON(_job.data)}`,
      SyncWorker.name
    );
  }

  @OnJobProgress()
  onJobProgress(_job: Job<SyncWorkerProcessData>, progress: number) {
    this.logger.log(`Processing..: ${progress}%`, SyncWorker.name);
  }

  @OnJobCompleted()
  onJobCompleted(_job: Job<SyncWorkerProcessData>) {
    this.logger.log(`The sync is done: ${_job.processName}`, SyncWorker.name);
  }

  @OnJobFailed()
  onJobFailed(_job: Job<SyncWorkerProcessData>, error: Error) {
    this.logger.error(
      `The sync is failed: ${toJSON({
        message: error.message,
        cause: error.cause,
        stack: error.stack,
        name: error.name,
      })}`,
      SyncWorker.name
    );
  }
}
