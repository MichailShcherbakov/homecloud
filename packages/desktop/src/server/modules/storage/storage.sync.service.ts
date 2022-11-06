import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { WatcherEventEnum, WatcherService } from "./watcher.service";
import { access } from "@/server/utils/access";
import { StorageManager } from "./storage.manager";
import { InjectQueue, Queue } from "../queue";
import { SyncWorkerProcessEnum } from "./storage.sync.worker";

@Injectable()
export class StorageSyncService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: Logger,
    private readonly watcherService: WatcherService,
    private readonly storageManager: StorageManager,
    @InjectQueue("sync") private readonly queue: Queue
  ) {}

  async onModuleInit() {
    await this.deleteUnreachedFiles();

    const absoluteRootPath = await this.config.getAbsoluteRootPath();

    this.watcherService.watch(absoluteRootPath, {
      ignored: /(.+)\.media/,
    });

    this.watcherService.on(
      absoluteRootPath,
      WatcherEventEnum.ON_FILE_ADDED,
      this.onFileAdded
    );

    this.watcherService.on(
      absoluteRootPath,
      WatcherEventEnum.ON_FILE_REMOVED,
      this.onFileRemoved
    );

    this.watcherService.on(
      absoluteRootPath,
      WatcherEventEnum.ON_DIR_ADDED,
      this.onDirAdded
    );

    this.watcherService.on(
      absoluteRootPath,
      WatcherEventEnum.ON_DIR_REMOVED,
      this.onDirRemoved
    );
  }

  async onModuleDestroy() {
    const absoluteRootPath = await this.config.getAbsoluteRootPath();

    this.watcherService.off(
      absoluteRootPath,
      WatcherEventEnum.ON_DIR_REMOVED,
      this.onDirRemoved
    );

    this.watcherService.off(
      absoluteRootPath,
      WatcherEventEnum.ON_DIR_ADDED,
      this.onDirAdded
    );

    this.watcherService.off(
      absoluteRootPath,
      WatcherEventEnum.ON_FILE_REMOVED,
      this.onFileRemoved
    );

    this.watcherService.off(
      absoluteRootPath,
      WatcherEventEnum.ON_FILE_ADDED,
      this.onFileAdded
    );

    this.watcherService.unwatch(absoluteRootPath);
  }

  private onFileAdded = async (absolutePath: string): Promise<void> => {
    this.logger.log(
      `The file was detected: ${absolutePath}`,
      StorageSyncService.name
    );

    const isFileExists = !!(await this.storageManager.getFileByAbsolutePath(
      absolutePath
    ));

    if (isFileExists) {
      this.logger.error(`The file already exists: ${absolutePath}`);
      return;
    }

    this.queue.addJob(SyncWorkerProcessEnum.ADD_FILE, {
      absolutePath,
    });
  };

  private onFileRemoved = async (absolutePath: string): Promise<void> => {
    this.logger.log(
      `Deleting the file was detected: ${absolutePath}`,
      StorageSyncService.name
    );

    const isFileExists = !!(await this.storageManager.getFileByAbsolutePath(
      absolutePath
    ));

    if (!isFileExists) {
      this.logger.error(`The file was not found: ${absolutePath}`);
      return;
    }

    this.queue.addJob(SyncWorkerProcessEnum.REMOVE_FILE, {
      absolutePath,
    });
  };

  private onDirAdded = async (absolutePath: string): Promise<void> => {
    const absoluteRootPath = await this.config.getAbsoluteRootPath();

    if (absolutePath === absoluteRootPath) return;

    this.logger.log(
      `The directory was detected: ${absolutePath}`,
      StorageSyncService.name
    );

    const isDirExists = !!(await this.storageManager.getDirectoryByAbsolutePath(
      absolutePath
    ));

    if (isDirExists) {
      this.logger.error(`The directory already exists: ${absolutePath}`);
      return;
    }

    this.queue.addJob(SyncWorkerProcessEnum.ADD_DIR, {
      absolutePath,
    });
  };

  private onDirRemoved = async (absolutePath: string): Promise<void> => {
    this.logger.log(
      `Deleting the directory was detected: ${absolutePath}`,
      StorageSyncService.name
    );

    const isDirExists = !!(await this.storageManager.getDirectoryByAbsolutePath(
      absolutePath
    ));

    if (!isDirExists) {
      this.logger.error(`The directory was not found: ${absolutePath}`);
      return;
    }

    this.queue.addJob(SyncWorkerProcessEnum.REMOVE_DIR, {
      absolutePath,
    });
  };

  private async deleteUnreachedFiles() {
    const files = await this.storageManager.getFiles();

    const filesWithDeleteFlag = await Promise.all(
      files.map(async f => ({
        ...f,
        isDeleted: !(await access(f.absolutePath)),
      }))
    );

    filesWithDeleteFlag
      .filter(f => f.isDeleted)
      .map(f => this.onFileRemoved(f.absolutePath));
  }
}
