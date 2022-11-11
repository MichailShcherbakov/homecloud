import { MetadataEntity } from "@/server/db/entities/metadata.entity";
import { toJSON } from "@/server/utils/format";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import e from "express";
import { ROOT_RELATIVE_PATH } from "../config/config.constants";
import { ConfigService } from "../config/config.service";
import {
  FileSystemEventEnum,
  FileSystemService,
  MetadataService,
} from "../file-system";
import { InjectQueue, Queue } from "../queue";
import { ReferenceService } from "../storage/reference.service";
import { SyncWorkerProcessEnum, SYNC_QUEUE_NAME } from "./constants";
import { SyncWorkerProcessData } from "./sync.worker";

@Injectable()
export class SyncFileSystemService {
  constructor(
    private readonly config: ConfigService,
    private readonly metadata: MetadataService,
    private readonly referenceService: ReferenceService,
    private readonly fs: FileSystemService,
    @InjectQueue(SYNC_QUEUE_NAME) private readonly queue: Queue
  ) {}

  @OnEvent(FileSystemEventEnum.ON_FILE_ADDED)
  async onFileAdded(
    toAbsolutePath: string,
    metadata: MetadataEntity
  ): Promise<void> {
    const fileRef = await this.referenceService.getRefByMetadata(metadata);

    /* skip */
    if (fileRef) return;

    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.ADD_FILE, {
      kind: "fs",
      toAbsolutePath,
      metadata,
      metadataInfo: metadata.getInfo(),
    });
  }

  @OnEvent(FileSystemEventEnum.ON_FILE_RENAMED)
  async onFileRenamed(
    toAbsolutePath: string,
    fromAbsolutePath: string,
    metadata: MetadataEntity
  ): Promise<void> {
    const metadataInfo = metadata.getInfo();
    const fileRef = await this.referenceService.getRefByMetadata(metadata);

    /* skip */
    if (fileRef?.file?.name === metadataInfo.name) return;

    this.queue.addJob<SyncWorkerProcessData>(
      SyncWorkerProcessEnum.RENAME_FILE,
      {
        kind: "fs",
        toAbsolutePath,
        fromAbsolutePath,
        metadata,
        metadataInfo: metadata.getInfo(),
      }
    );
  }

  @OnEvent(FileSystemEventEnum.ON_FILE_MOVED)
  async onFileMoved(
    toAbsolutePath: string,
    fromAbsolutePath: string,
    metadata: MetadataEntity
  ): Promise<void> {
    const fileMetadataInfo = metadata.getInfo();
    const fileRef = await this.referenceService.getRefByMetadata(metadata);

    const destDirectoryMetadata = await this.metadata.get(
      fileMetadataInfo.absoluteDirectoryPath
    );

    if (!destDirectoryMetadata)
      throw new Error(
        `The dest directory metadata was not found: ${fileMetadataInfo.absoluteDirectoryPath}`
      );

    const destDirRef = await this.referenceService.getRefByMetadata(
      destDirectoryMetadata
    );

    /* skip */
    if (fileRef?.file?.directoryUuid === destDirRef?.directoryUuid) return;

    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.MOVE_FILE, {
      kind: "fs",
      toAbsolutePath,
      fromAbsolutePath,
      metadata,
      metadataInfo: metadata.getInfo(),
    });
  }

  @OnEvent(FileSystemEventEnum.ON_FILE_REMOVED)
  async onFileRemoved(toAbsolutePath: string, metadata: MetadataEntity) {
    /* skip. Deleting metadata will provoke deleting file entity in the storage */
    return;

    this.queue.addJob<SyncWorkerProcessData>(
      SyncWorkerProcessEnum.REMOVE_FILE,
      {
        kind: "fs",
        toAbsolutePath,
        metadata,
        metadataInfo: metadata.getInfo(),
      }
    );
  }

  @OnEvent(FileSystemEventEnum.ON_DIR_ADDED)
  async onDirAdded(
    toAbsolutePath: string,
    metadata: MetadataEntity
  ): Promise<void> {
    const directoryRef = await this.referenceService.getRefByMetadata(metadata);

    /* skip */
    if (directoryRef) return;

    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.ADD_DIR, {
      kind: "fs",
      toAbsolutePath,
      metadata,
      metadataInfo: metadata.getInfo(),
    });
  }

  @OnEvent(FileSystemEventEnum.ON_DIR_RENAMED)
  async onNameRenamed(
    toAbsolutePath: string,
    fromAbsolutePath: string,
    metadata: MetadataEntity
  ): Promise<void> {
    const metadataInfo = metadata.getInfo();
    const { directory } = await this.referenceService.getRefByMetadataOrFail(
      metadata
    );

    if (!directory)
      throw new Error(`The directory was not found: ${toJSON(metadata)}`);

    /* skip */
    if (directory.name === metadataInfo.name) return;

    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.RENAME_DIR, {
      kind: "fs",
      toAbsolutePath,
      fromAbsolutePath,
      metadata,
      metadataInfo: metadata.getInfo(),
    });
  }

  @OnEvent(FileSystemEventEnum.ON_DIR_MOVED)
  async onDirMoved(
    toAbsolutePath: string,
    fromAbsolutePath: string,
    metadata: MetadataEntity
  ): Promise<void> {
    const metadataInfo = metadata.getInfo();
    const { directory } = await this.referenceService.getRefByMetadataOrFail(
      metadata
    );

    if (!directory)
      throw new Error(`The directory was not found: ${toJSON(metadata)}`);

    const absoluteRootPath = this.config.getRelativePathBy(
      metadataInfo.absoluteDirectoryPath
    );

    if (absoluteRootPath === ROOT_RELATIVE_PATH) {
      /* skip */
      if (!directory.parentUuid) return;
    } else {
      const destDirectoryMetadata = await this.metadata.get(
        metadataInfo.absoluteDirectoryPath
      );

      if (!destDirectoryMetadata)
        throw new Error(
          `The dest directory metadata was not found: ${metadataInfo.absoluteDirectoryPath}`
        );

      const { directory: destDirectory } =
        await this.referenceService.getRefByMetadataOrFail(
          destDirectoryMetadata
        );

      if (!destDirectory)
        throw new Error(
          `The dest directory was not found: ${toJSON(metadata)}`
        );

      /* skip */
      if (directory.parentUuid === destDirectory.uuid) return;
    }

    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.MOVE_DIR, {
      kind: "fs",
      toAbsolutePath,
      fromAbsolutePath,
      metadata,
      metadataInfo: metadata.getInfo(),
    });
  }

  @OnEvent(FileSystemEventEnum.ON_DIR_REMOVED)
  async onDirRemoved(toAbsolutePath: string, metadata: MetadataEntity) {
    /* skip. Deleting metadata will provoke deleting file entity in the storage */
    return;

    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.REMOVE_DIR, {
      kind: "fs",
      toAbsolutePath,
      metadata,
      metadataInfo: metadata.getInfo(),
    });
  }
}
