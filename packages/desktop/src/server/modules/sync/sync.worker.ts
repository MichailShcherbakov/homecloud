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
import { SyncWorkerProcessEnum, SYNC_QUEUE_NAME } from "./sync.constans";
import { computeFileHash } from "@/server/utils/fs/computeFileHash";
import { join, basename } from "path";
import { FileSystemService } from "../file-system/file-system.service";
import { toJSON } from "@/server/utils/format";
import { FileService } from "../storage/file.service";
import { DirectoryService } from "../storage/directory.service";
import { computeHash } from "@/server/utils/format/computeFileHash";
import { MetadataEntity } from "@/server/db/entities/metadata.entity";

export interface ISyncWorkerProcessData {
  kind: string;
}

export interface SyncWorkerProcessDataFromFS extends ISyncWorkerProcessData {
  kind: "fs";
  metadata: MetadataEntity;
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
    private readonly fileService: FileService,
    private readonly directoryService: DirectoryService,
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

      const absoluteTempPath = join(
        this.config.getAbsoluteTempPath(),
        file.uuid
      );

      let absoluteDestPath = absoluteRootPath;

      if (file.directoryUuid) {
        const directory = await this.directoryService.getDirectoryByUuid(
          file.directoryUuid
        );

        if (!directory)
          throw new Error(`The directory was not found: ${file.directoryUuid}`);

        absoluteDestPath = await this.directoryService.getAbsolutePathByEntity(
          directory
        );
      }

      await this.fs.mv(absoluteTempPath, absoluteDestPath);

      return file;
    }

    if (data.kind === "fs") {
      const { toAbsolutePath } = data;

      const absoluteRootPath = this.config.getAbsoluteRootPath();

      const fileInfo = await this.fs.getFileInfo(toAbsolutePath);

      if (!fileInfo)
        throw new Error(`Failed to get file info: ${toAbsolutePath}`);

      const newFile = new FileEntity();
      newFile.name = fileInfo.name;
      newFile.hash = await computeFileHash(toAbsolutePath);
      newFile.size = fileInfo.size;

      if (fileInfo.absoluteDirectoryPath === absoluteRootPath) {
        return this.fileService.createFile(newFile);
      }

      const destDirectory =
        await this.directoryService.getDirectoryByAbsolutePath(
          fileInfo.absoluteDirectoryPath
        );

      if (!destDirectory)
        throw new Error(
          `The parent directory was not found: ${fileInfo.absoluteDirectoryPath}`
        );

      return this.fileService.createFile(newFile, destDirectory);
    }

    throw new Error(`Unknown kind: ${toJSON(data)}`);
  }

  @Process(SyncWorkerProcessEnum.REMOVE_FILE)
  async removeFile(
    job: Job<SyncWorkerProcessData<FileEntity>>
  ): Promise<FileEntity> {
    const { data } = job;

    if (data.kind === "storage") {
      const { entity: file } = data;

      const absolutePath = await this.directoryService.getAbsolutePathByEntity(
        file
      );

      await this.fs.rm(absolutePath, {
        recursive: true,
        force: true,
      });

      return file;
    }

    if (data.kind === "fs") {
      const { toAbsolutePath } = data;

      const foundFile = await this.fileService.getFileByAbsolutePath(
        toAbsolutePath
      );

      if (!foundFile)
        throw new Error(`The file was not found: ${toAbsolutePath}`);

      await this.fileService.deleteFileByUuid(foundFile.uuid);

      return foundFile;
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

      const absolutePath = await this.directoryService.getAbsolutePathByEntity(
        directory
      );

      await this.fs.mkdir(absolutePath);

      return directory;
    }

    if (data.kind === "fs") {
      const { toAbsolutePath } = data;

      const absoluteRootPath = this.config.getAbsoluteRootPath();

      const directoryInfo = await this.fs.getDirectoryInfo(toAbsolutePath);

      if (!directoryInfo)
        throw new Error(`Failed to get directory info: ${toAbsolutePath}`);

      const newDirectory = new DirectoryEntity();
      newDirectory.name = directoryInfo.name;
      newDirectory.hash = await computeHash(directoryInfo.ino.toString());
      newDirectory.size = directoryInfo.size;

      if (directoryInfo.absoluteDirectoryPath === absoluteRootPath) {
        return this.directoryService.createDirectory(newDirectory);
      }

      const parentDirectory =
        await this.directoryService.getDirectoryByAbsolutePath(
          directoryInfo.absoluteDirectoryPath
        );

      if (!parentDirectory)
        throw new Error(
          `The parent directory was not found: ${directoryInfo.absoluteDirectoryPath}`
        );

      return this.directoryService.createDirectory(
        newDirectory,
        parentDirectory
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

      const absolutePath = await this.directoryService.getAbsolutePathByEntity(
        directory
      );

      const oldAbsolutePath =
        await this.directoryService.getAbsolutePathByEntity(oldDirectory);

      await this.fs.rename(oldAbsolutePath, absolutePath);

      return directory;
    }

    if (data.kind === "fs") {
      const { metadata } = data;

      const directory = await this.directoryService.getDirectoryByMetadata(
        metadata
      );

      if (!directory)
        throw new Error(`The directory was not found: ${toJSON(metadata)}`);

      return this.directoryService.renameDirectory(
        directory,
        basename(metadata.path)
      );
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

      const [absolutePath, oldAbsolutePath] = await Promise.all([
        this.directoryService.getAbsolutePathByEntity(directory),
        this.directoryService.getAbsolutePathByEntity(oldDirectory),
      ]);

      await this.fs.rename(oldAbsolutePath, absolutePath);

      return directory;
    }

    if (data.kind === "fs") {
      const { toAbsolutePath, metadata } = data;

      const absoluteRootPath = this.config.getAbsoluteRootPath();

      const [directory, directoryInfo] = await Promise.all([
        this.directoryService.getDirectoryByMetadata(metadata),
        this.fs.getDirectoryInfo(toAbsolutePath),
      ]);

      if (!directory)
        throw new Error(`The directory was not found: ${toAbsolutePath}`);

      if (!directoryInfo)
        throw new Error(`Failed to get directory info: ${toAbsolutePath}`);

      if (directoryInfo.absoluteDirectoryPath === absoluteRootPath) {
        return this.directoryService.moveDirectory(directory);
      }
      const destDirectoryMetadata = await this.fs.getMetadataByPath(
        directoryInfo.absoluteDirectoryPath
      );

      if (!destDirectoryMetadata)
        throw new Error(
          `The dest directory metadata was not found: ${directoryInfo.absoluteDirectoryPath}`
        );

      const destDirectory = await this.directoryService.getDirectoryByMetadata(
        destDirectoryMetadata
      );

      if (!destDirectory)
        throw new Error(
          `The dest directory was not found: ${toJSON(destDirectoryMetadata)}`
        );

      return this.directoryService.moveDirectory(directory, destDirectory);
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

      const absolutePath = await this.directoryService.getAbsolutePathByEntity(
        directory
      );

      await this.fs.rm(absolutePath, {
        recursive: true,
        force: true,
      });

      return directory;
    }

    if (data.kind === "fs") {
      const { metadata } = data;

      const foundDirectory = await this.directoryService.getDirectoryByMetadata(
        metadata
      );

      // In the file system, root directory delete firstly, and then it's descendants,
      // so it's normal that some directory will not to be found
      if (!foundDirectory) return null;

      await this.directoryService.deleteDirectoryByUuid(foundDirectory.uuid);

      return foundDirectory;
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
