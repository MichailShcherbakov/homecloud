import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { WatcherEventEnum, WatcherService } from "./watcher";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FileSystemEventEnum } from "./file-system.events";
import { mv } from "@/server/utils/fs/mv";
import * as fs from "fs/promises";
import { access } from "@/server/utils/fs";
import { hide } from "hidefile";
import { BigIntStats } from "fs";
import { DirectoryInfo, FileInfo } from "@/server/utils/getFileInfo";
import { parse, basename } from "path";

@Injectable()
export class FileSystemService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: Logger,
    private readonly watcherService: WatcherService,
    private readonly emitter: EventEmitter2
  ) {}

  async onModuleInit(): Promise<void> {
    const absoluteRootPath = this.config.getAbsoluteRootPath();

    await this.watcherService.watch(absoluteRootPath, {
      ignored: /(^|[\/\\])\../,
    });

    this.watcherService.on(
      absoluteRootPath,
      WatcherEventEnum.ON_FILE_ADDED,
      this.onFileAdded
    );

    this.watcherService.on(
      absoluteRootPath,
      WatcherEventEnum.ON_FILE_MOVED,
      this.onFileMoved
    );

    this.watcherService.on(
      absoluteRootPath,
      WatcherEventEnum.ON_FILE_RENAMED,
      this.onFileRenamed
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
      WatcherEventEnum.ON_DIR_MOVED,
      this.onDirMoved
    );

    this.watcherService.on(
      absoluteRootPath,
      WatcherEventEnum.ON_DIR_RENAMED,
      this.onDirRenamed
    );

    this.watcherService.on(
      absoluteRootPath,
      WatcherEventEnum.ON_DIR_REMOVED,
      this.onDirRemoved
    );
  }

  async onModuleDestroy(): Promise<void> {
    const absoluteRootPath = this.config.getAbsoluteRootPath();

    this.watcherService.off(
      absoluteRootPath,
      WatcherEventEnum.ON_FILE_ADDED,
      this.onFileAdded
    );

    this.watcherService.off(
      absoluteRootPath,
      WatcherEventEnum.ON_FILE_MOVED,
      this.onFileMoved
    );

    this.watcherService.off(
      absoluteRootPath,
      WatcherEventEnum.ON_FILE_RENAMED,
      this.onFileRenamed
    );

    this.watcherService.off(
      absoluteRootPath,
      WatcherEventEnum.ON_FILE_REMOVED,
      this.onFileRemoved
    );

    this.watcherService.off(
      absoluteRootPath,
      WatcherEventEnum.ON_DIR_ADDED,
      this.onDirAdded
    );

    this.watcherService.off(
      absoluteRootPath,
      WatcherEventEnum.ON_DIR_MOVED,
      this.onDirMoved
    );

    this.watcherService.off(
      absoluteRootPath,
      WatcherEventEnum.ON_DIR_RENAMED,
      this.onDirRenamed
    );

    this.watcherService.off(
      absoluteRootPath,
      WatcherEventEnum.ON_DIR_REMOVED,
      this.onDirRemoved
    );

    await this.watcherService.unwatch(absoluteRootPath);
  }

  private onFileAdded = (absolutePath: string): void => {
    this.logger.log(
      `The file was detected: ${absolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(FileSystemEventEnum.ON_FILE_ADDED, absolutePath);
  };

  private onFileMoved = (
    newAbsolutePath: string,
    oldAbsolutePath: string
  ): void => {
    this.logger.log(
      `The file was moved:\n - from: ${oldAbsolutePath}\n - to: ${newAbsolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(
      FileSystemEventEnum.ON_FILE_MOVED,
      newAbsolutePath,
      oldAbsolutePath
    );
  };

  private onFileRenamed = (
    newAbsolutePath: string,
    oldAbsolutePath: string
  ): void => {
    this.logger.log(
      `The file was renamed:\n - new: ${newAbsolutePath}\n - old: ${oldAbsolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(
      FileSystemEventEnum.ON_FILE_RENAMED,
      newAbsolutePath,
      oldAbsolutePath
    );
  };

  private onFileRemoved = (absolutePath: string): void => {
    this.logger.log(
      `The file was removed: ${absolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(FileSystemEventEnum.ON_FILE_REMOVED, absolutePath);
  };

  private onDirAdded = (absolutePath: string): void => {
    this.logger.log(
      `The directory was detected: ${absolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(FileSystemEventEnum.ON_DIR_ADDED, absolutePath);
  };

  private onDirMoved = (
    newAbsolutePath: string,
    oldAbsolutePath: string
  ): void => {
    this.logger.log(
      `The directory was moved:\n - from: ${oldAbsolutePath}\n - to: ${newAbsolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(
      FileSystemEventEnum.ON_DIR_MOVED,
      newAbsolutePath,
      oldAbsolutePath
    );
  };

  private onDirRenamed = (
    newAbsolutePath: string,
    oldAbsolutePath: string
  ): void => {
    this.logger.log(
      `The directory was renamed:\n - new: ${newAbsolutePath}\n - old: ${oldAbsolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(
      FileSystemEventEnum.ON_DIR_RENAMED,
      newAbsolutePath,
      oldAbsolutePath
    );
  };

  private onDirRemoved = (absolutePath: string): void => {
    this.logger.log(
      `The directory was removed: ${absolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(FileSystemEventEnum.ON_DIR_REMOVED, absolutePath);
  };

  public async mv(fromPath: string, toPath: string): Promise<void> {
    this.watcherService.pauseWatch(toPath);

    await mv(fromPath, toPath);

    this.watcherService.resumeWatch(toPath);
  }

  public hide(absolutePath: string): Promise<void> {
    return new Promise((res, rej) => {
      hide(absolutePath, err => {
        if (err) {
          rej(err);
          return;
        }

        res();
      });
    });
  }

  public getStat(absolutePath: string): Promise<BigIntStats> {
    return fs.stat(absolutePath, {
      bigint: true,
    });
  }

  public async createFile(absolutePath: string, data: string): Promise<void> {
    this.watcherService.pauseWatch(absolutePath);

    await fs.writeFile(absolutePath, data);

    this.watcherService.resumeWatch(absolutePath);
  }

  public async rename(
    oldAbsolutePath: string,
    absolutePath: string
  ): Promise<void> {
    this.watcherService.pauseWatch(absolutePath);

    await fs.rename(oldAbsolutePath, absolutePath);

    this.watcherService.resumeWatch(absolutePath);
  }

  public async rm(
    absolutePath: string,
    options: { recursive?: boolean; force?: boolean }
  ): Promise<void> {
    this.watcherService.pauseWatch(absolutePath);

    await fs.rm(absolutePath, options);

    this.watcherService.resumeWatch(absolutePath);
  }

  public async mkdir(absolutePath: string): Promise<void> {
    this.watcherService.pauseWatch(absolutePath);

    await fs.mkdir(absolutePath);

    this.watcherService.resumeWatch(absolutePath);
  }

  public access(absolutePath: string): Promise<boolean> {
    return access(absolutePath);
  }

  public async getFileInfo(absolutePath: string): Promise<FileInfo | null> {
    const stat = await this.getStat(absolutePath);

    if (!stat.isFile()) return null;

    const { ext, name, dir } = parse(absolutePath);

    return {
      ino: stat.ino,
      name,
      ext,
      size: stat.size,
      absoluteDirectoryPath: dir,
    };
  }

  public async getDirectoryInfo(
    absolutePath: string
  ): Promise<DirectoryInfo | null> {
    const stat = await this.getStat(absolutePath);

    if (!stat.isDirectory()) return null;

    const dir = absolutePath.split("\\").slice(0, -1).join("\\");

    const name = basename(absolutePath);

    return {
      ino: stat.ino,
      name,
      size: stat.size,
      absoluteDirectoryPath: dir,
    };
  }
}
