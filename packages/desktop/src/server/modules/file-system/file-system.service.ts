import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { MetadataService, WatcherEventEnum, WatcherService } from "./watcher";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FileSystemEventEnum } from "./file-system.events";
import { mv } from "@/server/utils/fs/mv";
import * as fs from "fs/promises";
import { access } from "@/server/utils/fs";
import { hide } from "hidefile";
import { BigIntStats } from "fs";
import { DirectoryInfo, FileInfo } from "@/server/utils/getFileInfo";
import { parse, basename } from "path";
import { MetadataEntity } from "@/server/db/entities/metadata.entity";

@Injectable()
export class FileSystemService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: Logger,
    private readonly metadata: MetadataService,
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

  private onFileAdded = (
    toAbsolutePath: string,
    metadata: MetadataEntity
  ): void => {
    this.logger.log(
      `The file was detected: ${toAbsolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(
      FileSystemEventEnum.ON_FILE_ADDED,
      toAbsolutePath,
      metadata
    );
  };

  private onFileMoved = (
    toAbsolutePath: string,
    fromAbsolutePath: string,
    metadata: MetadataEntity
  ): void => {
    this.logger.log(
      `The file was moved:\n - from: ${fromAbsolutePath}\n - to: ${toAbsolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(
      FileSystemEventEnum.ON_FILE_MOVED,
      toAbsolutePath,
      fromAbsolutePath,
      metadata
    );
  };

  private onFileRenamed = (
    toAbsolutePath: string,
    fromAbsolutePath: string,
    metadata: MetadataEntity
  ): void => {
    this.logger.log(
      `The file was renamed:\n - new: ${toAbsolutePath}\n - old: ${fromAbsolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(
      FileSystemEventEnum.ON_FILE_RENAMED,
      toAbsolutePath,
      fromAbsolutePath,
      metadata
    );
  };

  private onFileRemoved = (
    toAbsolutePath: string,
    metadata: MetadataEntity
  ): void => {
    this.logger.log(
      `The file was removed: ${toAbsolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(
      FileSystemEventEnum.ON_FILE_REMOVED,
      toAbsolutePath,
      metadata
    );
  };

  private onDirAdded = (
    toAbsolutePath: string,
    metadata: MetadataEntity
  ): void => {
    this.logger.log(
      `The directory was detected: ${toAbsolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(
      FileSystemEventEnum.ON_DIR_ADDED,
      toAbsolutePath,
      metadata
    );
  };

  private onDirMoved = (
    toAbsolutePath: string,
    fromAbsolutePath: string,
    metadata: MetadataEntity
  ): void => {
    this.logger.log(
      `The directory was moved:\n - from: ${fromAbsolutePath}\n - to: ${toAbsolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(
      FileSystemEventEnum.ON_DIR_MOVED,
      toAbsolutePath,
      fromAbsolutePath,
      metadata
    );
  };

  private onDirRenamed = (
    toAbsolutePath: string,
    fromAbsolutePath: string,
    metadata: MetadataEntity
  ): void => {
    this.logger.log(
      `The directory was renamed:\n - new: ${toAbsolutePath}\n - old: ${fromAbsolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(
      FileSystemEventEnum.ON_DIR_RENAMED,
      toAbsolutePath,
      fromAbsolutePath,
      metadata
    );
  };

  private onDirRemoved = (
    toAbsolutePath: string,
    metadata: MetadataEntity
  ): void => {
    this.logger.log(
      `The directory was removed: ${toAbsolutePath}`,
      FileSystemService.name
    );

    this.emitter.emit(
      FileSystemEventEnum.ON_DIR_REMOVED,
      toAbsolutePath,
      metadata
    );
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
      ino: stat.ino.toString(),
      name,
      ext,
      size: Number(stat.size),
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
      ino: stat.ino.toString(),
      name,
      size: Number(stat.size),
      absoluteDirectoryPath: dir,
    };
  }

  public getMetadataByPath(
    absolutePath: string
  ): Promise<MetadataEntity | null> {
    return this.metadata.get(absolutePath);
  }
}
