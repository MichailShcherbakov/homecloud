import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { FileSystemEventEnum } from "../file-system";
import { InjectQueue, Queue } from "../queue";
import { DirectoryService } from "../storage/directory.service";
import { SyncWorkerProcessEnum, SYNC_QUEUE_NAME } from "./sync.constans";
import { SyncWorkerProcessData } from "./sync.worker";

@Injectable()
export class SyncFileSystemService {
  constructor(
    private readonly directoryService: DirectoryService,
    @InjectQueue(SYNC_QUEUE_NAME) private readonly queue: Queue
  ) {}

  @OnEvent(FileSystemEventEnum.ON_FILE_ADDED)
  async onFileAdded(absolutePath: string): Promise<void> {
    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.ADD_FILE, {
      kind: "fs",
      absolutePath,
    });
  }

  @OnEvent(FileSystemEventEnum.ON_FILE_RENAMED)
  async onFileRenamed(
    newAbsolutePath: string,
    oldAbsolutePath: string
  ): Promise<void> {
    this.queue.addJob<SyncWorkerProcessData>(
      SyncWorkerProcessEnum.RENAME_FILE,
      {
        kind: "fs",
        absolutePath: newAbsolutePath,
        oldAbsolutePath: oldAbsolutePath,
      }
    );
  }

  @OnEvent(FileSystemEventEnum.ON_FILE_MOVED)
  async onFileMoved(
    newAbsolutePath: string,
    oldAbsolutePath: string
  ): Promise<void> {
    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.MOVE_FILE, {
      kind: "fs",
      absolutePath: newAbsolutePath,
      oldAbsolutePath: oldAbsolutePath,
    });
  }

  @OnEvent(FileSystemEventEnum.ON_FILE_REMOVED)
  async onFileRemoved(absolutePath: string) {
    this.queue.addJob<SyncWorkerProcessData>(
      SyncWorkerProcessEnum.REMOVE_FILE,
      {
        kind: "fs",
        absolutePath,
      }
    );
  }

  @OnEvent(FileSystemEventEnum.ON_DIR_ADDED)
  async onDirAdded(absolutePath: string): Promise<void> {
    const foundDirectory =
      await this.directoryService.getDirectoryByAbsolutePath(absolutePath);

    if (foundDirectory) return;

    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.ADD_DIR, {
      kind: "fs",
      absolutePath,
    });
  }

  @OnEvent(FileSystemEventEnum.ON_DIR_RENAMED)
  async onNameRenamed(
    newAbsolutePath: string,
    oldAbsolutePath: string
  ): Promise<void> {
    const hash = await this.directoryService.getDirectoryHashByAbsolutePath(
      newAbsolutePath
    );
    const directory = await this.directoryService.getDirectoryByHash(hash);

    if (directory) return;

    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.RENAME_DIR, {
      kind: "fs",
      absolutePath: newAbsolutePath,
      oldAbsolutePath: oldAbsolutePath,
    });
  }

  @OnEvent(FileSystemEventEnum.ON_DIR_MOVED)
  async onDirMoved(
    newAbsolutePath: string,
    oldAbsolutePath: string
  ): Promise<void> {
    const hash = await this.directoryService.getDirectoryHashByAbsolutePath(
      newAbsolutePath
    );
    const directory = await this.directoryService.getDirectoryByHash(hash);

    if (directory) return;

    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.MOVE_DIR, {
      kind: "fs",
      absolutePath: newAbsolutePath,
      oldAbsolutePath: oldAbsolutePath,
    });
  }

  @OnEvent(FileSystemEventEnum.ON_DIR_REMOVED)
  async onDirRemoved(absolutePath: string) {
    const foundDirectory =
      await this.directoryService.getDirectoryByAbsolutePath(absolutePath);

    if (!foundDirectory) return;

    this.queue.addJob<SyncWorkerProcessData>(SyncWorkerProcessEnum.REMOVE_DIR, {
      kind: "fs",
      absolutePath,
    });
  }
}
