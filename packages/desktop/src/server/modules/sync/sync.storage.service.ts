import { FileEntity } from "@/server/db/entities/file.entity";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectQueue, Queue } from "../queue";
import { StorageEventEnum } from "../storage/storage.events";
import { SyncWorkerProcessEnum, SYNC_QUEUE_NAME } from "./sync.constans";
import { SyncWorkerProcessData } from "./sync.worker";
import { DirectoryEntity } from "@/server/db/entities/directory.entity";

@Injectable()
export class SyncStorageService {
  constructor(@InjectQueue(SYNC_QUEUE_NAME) private readonly queue: Queue) {}

  @OnEvent(StorageEventEnum.ON_FILE_ADDED)
  async onFileAdded(newFile: FileEntity): Promise<void> {
    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.ADD_FILE, {
      kind: "storage",
      entity: newFile,
    });
  }

  @OnEvent(StorageEventEnum.ON_FILE_RENAMED)
  async onFileRenamed(newFile: FileEntity, oldFile: FileEntity): Promise<void> {
    this.queue.addJob<SyncWorkerProcessData>(
      SyncWorkerProcessEnum.RENAME_FILE,
      {
        kind: "storage",
        entity: newFile,
        oldEntity: oldFile,
      }
    );
  }

  @OnEvent(StorageEventEnum.ON_FILE_MOVED)
  async onFileMoved(newFile: FileEntity, oldFile: FileEntity): Promise<void> {
    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.MOVE_FILE, {
      kind: "storage",
      entity: newFile,
      oldEntity: oldFile,
    });
  }

  @OnEvent(StorageEventEnum.ON_FILE_REMOVED)
  async onFileRemoved(deletedFile: FileEntity) {
    this.queue.addJob<SyncWorkerProcessData>(
      SyncWorkerProcessEnum.REMOVE_FILE,
      {
        kind: "storage",
        entity: deletedFile,
      }
    );
  }

  @OnEvent(StorageEventEnum.ON_DIR_ADDED)
  async onDirAdded(newDir: DirectoryEntity): Promise<void> {
    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.ADD_DIR, {
      kind: "storage",
      entity: newDir,
    });
  }

  @OnEvent(StorageEventEnum.ON_DIR_RENAMED)
  async onNameRenamed(
    newDir: DirectoryEntity,
    oldDir: DirectoryEntity
  ): Promise<void> {
    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.RENAME_DIR, {
      kind: "storage",
      entity: newDir,
      oldEntity: oldDir,
    });
  }

  @OnEvent(StorageEventEnum.ON_DIR_MOVED)
  async onDirMoved(
    newDir: DirectoryEntity,
    oldDir: DirectoryEntity
  ): Promise<void> {
    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.MOVE_DIR, {
      kind: "storage",
      entity: newDir,
      oldEntity: oldDir,
    });
  }

  @OnEvent(StorageEventEnum.ON_DIR_REMOVED)
  async onDirRemoved(deletedDir: DirectoryEntity) {
    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.REMOVE_DIR, {
      kind: "storage",
      entity: deletedDir,
    });
  }
}
