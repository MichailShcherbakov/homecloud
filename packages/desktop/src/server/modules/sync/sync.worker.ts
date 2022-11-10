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

export interface ISyncWorkerProcessData {
  kind: string;
}

export interface SyncWorkerProcessDataFromFS extends ISyncWorkerProcessData {
  kind: "fs";
  absolutePath: string;
  oldAbsolutePath?: string;
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
      const { absolutePath } = data;

      const absoluteRootPath = this.config.getAbsoluteRootPath();

      const fileInfo = await this.fs.getFileInfo(absolutePath);

      if (!fileInfo)
        throw new Error(`Failed to get file info: ${absolutePath}`);

      const newFile = new FileEntity();
      newFile.name = fileInfo.name;
      newFile.hash = await computeFileHash(absolutePath);
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
      const { absolutePath } = data;

      const foundFile = await this.fileService.getFileByAbsolutePath(
        absolutePath
      );

      if (!foundFile)
        throw new Error(`The file was not found: ${absolutePath}`);

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
      const { absolutePath } = data;

      const absoluteRootPath = this.config.getAbsoluteRootPath();

      const directoryInfo = await this.fs.getDirectoryInfo(absolutePath);

      if (!directoryInfo)
        throw new Error(`Failed to get directory info: ${absolutePath}`);

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
      const { absolutePath, oldAbsolutePath } = data;

      if (!oldAbsolutePath)
        throw new Error(`The old absolute path is undefined`);

      const directory = await this.directoryService.getDirectoryByAbsolutePath(
        absolutePath
      );

      if (!directory)
        throw new Error(`The directory was not found: ${absolutePath}`);

      return this.directoryService.renameDirectory(
        directory,
        basename(oldAbsolutePath)
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
      const { absolutePath, oldAbsolutePath } = data;

      if (!oldAbsolutePath)
        throw new Error(`The old absolute path is undefined`);

      const [directory, directoryInfo] = await Promise.all([
        this.directoryService.getDirectoryByAbsolutePath(absolutePath),
        this.fs.getDirectoryInfo(absolutePath),
      ]);

      if (!directory)
        throw new Error(`The directory was not found: ${absolutePath}`);

      if (!directoryInfo)
        throw new Error(`Failed to get directory info: ${absolutePath}`);

      const destDirectory =
        await this.directoryService.getDirectoryByAbsolutePath(
          directoryInfo.absoluteDirectoryPath
        );

      return this.directoryService.moveDirectory(directory, destDirectory);
    }

    throw new Error(`Unknown kind`);
  }

  @Process(SyncWorkerProcessEnum.REMOVE_DIR)
  async removeDir(
    job: Job<SyncWorkerProcessData<DirectoryEntity>>
  ): Promise<DirectoryEntity> {
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
      const { absolutePath } = data;

      const foundDirectory =
        await this.directoryService.getDirectoryByAbsolutePath(absolutePath);

      if (!foundDirectory)
        throw new Error(`The directory was not found: ${absolutePath}`);

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
