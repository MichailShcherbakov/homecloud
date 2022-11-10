import { MetadataEntity } from "@/server/db/entities/metadata.entity";
import { computeHash } from "@/server/utils/format/computeFileHash";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ConfigService } from "../config/config.service";
import {
  FileSystemEventEnum,
  FileSystemService,
  MetadataService,
} from "../file-system";
import { InjectQueue, Queue } from "../queue";
import { DirectoryService } from "../storage/directory.service";
import { SyncWorkerProcessEnum, SYNC_QUEUE_NAME } from "./sync.constans";
import { SyncWorkerProcessData } from "./sync.worker";

@Injectable()
export class SyncFileSystemService {
  constructor(
    private readonly config: ConfigService,
    private readonly directoryService: DirectoryService,
    private readonly fs: FileSystemService,
    @InjectQueue(SYNC_QUEUE_NAME) private readonly queue: Queue
  ) {}

  @OnEvent(FileSystemEventEnum.ON_FILE_ADDED)
  async onFileAdded(
    toAbsolutePath: string,
    metadata: MetadataEntity
  ): Promise<void> {
    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.ADD_FILE, {
      kind: "fs",
      toAbsolutePath,
      metadata,
    });
  }

  @OnEvent(FileSystemEventEnum.ON_FILE_RENAMED)
  async onFileRenamed(
    toAbsolutePath: string,
    fromAbsolutePath: string,
    metadata: MetadataEntity
  ): Promise<void> {
    this.queue.addJob<SyncWorkerProcessData>(
      SyncWorkerProcessEnum.RENAME_FILE,
      {
        kind: "fs",
        toAbsolutePath,
        fromAbsolutePath,
        metadata,
      }
    );
  }

  @OnEvent(FileSystemEventEnum.ON_FILE_MOVED)
  async onFileMoved(
    toAbsolutePath: string,
    fromAbsolutePath: string,
    metadata: MetadataEntity
  ): Promise<void> {
    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.MOVE_FILE, {
      kind: "fs",
      toAbsolutePath,
      fromAbsolutePath,
      metadata,
    });
  }

  @OnEvent(FileSystemEventEnum.ON_FILE_REMOVED)
  async onFileRemoved(toAbsolutePath: string, metadata: MetadataEntity) {
    this.queue.addJob<SyncWorkerProcessData>(
      SyncWorkerProcessEnum.REMOVE_FILE,
      {
        kind: "fs",
        toAbsolutePath,
        metadata,
      }
    );
  }

  @OnEvent(FileSystemEventEnum.ON_DIR_ADDED)
  async onDirAdded(
    toAbsolutePath: string,
    metadata: MetadataEntity
  ): Promise<void> {
    const foundDirectory = await this.directoryService.getDirectoryByMetadata(
      metadata
    );

    /* skip */
    if (foundDirectory) return;

    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.ADD_DIR, {
      kind: "fs",
      toAbsolutePath,
      metadata,
    });
  }

  @OnEvent(FileSystemEventEnum.ON_DIR_RENAMED)
  async onNameRenamed(
    toAbsolutePath: string,
    fromAbsolutePath: string,
    metadata: MetadataEntity
  ): Promise<void> {
    const [directory, directoryInfo] = await Promise.all([
      this.directoryService.getDirectoryByMetadata(metadata),
      this.fs.getDirectoryInfo(toAbsolutePath),
    ]);

    /* skip */
    if (directory && directoryInfo && directory.name === directoryInfo.name)
      return;

    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.RENAME_DIR, {
      kind: "fs",
      toAbsolutePath,
      fromAbsolutePath,
      metadata,
    });
  }

  @OnEvent(FileSystemEventEnum.ON_DIR_MOVED)
  async onDirMoved(
    toAbsolutePath: string,
    fromAbsolutePath: string,
    metadata: MetadataEntity
  ): Promise<void> {
    const absoluteRootPath = this.config.getAbsoluteRootPath();

    const directoryInfo = await this.fs.getDirectoryInfo(toAbsolutePath);

    if (!directoryInfo)
      throw new Error(`The directory info was not found: ${toAbsolutePath}`);

    if (directoryInfo.absoluteDirectoryPath === absoluteRootPath) {
      const directory = await this.directoryService.getDirectoryByMetadata(
        metadata
      );

      /* skip */
      if (directory && !directory.parentUuid) return;
    } else {
      const destDirMetadata = await this.fs.getMetadataByPath(
        directoryInfo.absoluteDirectoryPath
      );

      if (!destDirMetadata)
        throw new Error(
          `The dest directory info was not found: ${directoryInfo.absoluteDirectoryPath}`
        );

      const [directory, destDirectory] = await Promise.all([
        this.directoryService.getDirectoryByMetadata(metadata),
        this.directoryService.getDirectoryByMetadata(destDirMetadata),
      ]);

      /* skip */
      if (
        directory &&
        destDirectory &&
        directory.parentUuid === destDirectory.uuid
      )
        return;
    }

    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.MOVE_DIR, {
      kind: "fs",
      toAbsolutePath,
      fromAbsolutePath,
      metadata,
    });
  }

  @OnEvent(FileSystemEventEnum.ON_DIR_REMOVED)
  async onDirRemoved(toAbsolutePath: string, metadata: MetadataEntity) {
    const foundDirectory = await this.directoryService.getDirectoryByMetadata(
      metadata
    );

    /* skip */
    if (!foundDirectory) return;

    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.REMOVE_DIR, {
      kind: "fs",
      toAbsolutePath,
      metadata,
    });
  }
}
