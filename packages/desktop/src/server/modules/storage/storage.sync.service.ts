import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { WatcherService } from "./watcher.service";
import { access } from "@/server/utils/access";
import { StorageManager } from "./storage.manager";
import { InjectQueue, Queue } from "../queue";

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

    const absoluteRootPath = await this.config.getRootPath();

    this.watcherService.watch(absoluteRootPath, {
      ignored: /(.+)\.media\/(.+)/,
    });

    this.watcherService.on(absoluteRootPath, "add", this.onFileDetected);
    this.watcherService.on(absoluteRootPath, "unlink", this.onFileDeleted);
  }

  async onModuleDestroy() {
    const absoluteRootPath = await this.config.getRootPath();

    this.watcherService.off(absoluteRootPath, "unlink", this.onFileDeleted);
    this.watcherService.off(absoluteRootPath, "add", this.onFileDetected);

    this.watcherService.unwatch(absoluteRootPath);
  }

  private onFileDetected = async (absolutePath: string): Promise<void> => {
    this.logger.log(
      `The entity was detected: ${absolutePath}`,
      StorageSyncService.name
    );

    const isFileExists = Boolean(
      await this.storageManager.findOneFileByAbsolutePath(absolutePath)
    );

    if (isFileExists) return;

    this.queue.addJob("link", {
      absolutePath,
    });
  };

  private onFileDeleted = async (absolutePath: string): Promise<void> => {
    this.logger.log(
      `Deleting the entity was detected: ${absolutePath}`,
      StorageSyncService.name
    );

    this.queue.addJob("unlink", {
      absolutePath,
    });
  };

  private async deleteUnreachedFiles() {
    const files = await this.storageManager.findFiles();

    const filesWithDeleteFlag = await Promise.all(
      files.map(async f => ({
        ...f,
        isDeleted: !(await access(f.absolutePath)),
      }))
    );

    filesWithDeleteFlag
      .filter(f => f.isDeleted)
      .map(f => this.onFileDeleted(f.absolutePath));
  }
}
