import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { FileEntity } from "@/server/db/entities/file.entity";
import { getFileStat } from "@/server/utils/getFileStat";
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { ConfigService } from "../config/config.service";
import { createWorker, QueueManager } from "../queue/queue.manager";
import {
  SynchronizerWorkerContext,
  SYNCHRONIZER_CREATE_WORKER_TYPE,
  SYNCHRONIZER_REMOVE_WORKER_TYPE,
} from "./synchronizer.worker";
import { WatcherService } from "./watcher.service";
import { basename, dirname } from "path";
import { access } from "@/server/utils/access";

@Injectable()
export class SynchronizerService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: Logger,
    private readonly watcherService: WatcherService,
    private readonly queueManager: QueueManager,
    @InjectRepository(DirectoryEntity)
    private readonly directoriesRepository: Repository<DirectoryEntity>,
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>
  ) {}

  async onModuleInit() {
    this.queueManager.addWorker(SYNCHRONIZER_CREATE_WORKER_TYPE, () =>
      createWorker<SynchronizerWorkerContext>(this.addFile.bind(this))
    );

    this.queueManager.addWorker(SYNCHRONIZER_REMOVE_WORKER_TYPE, () =>
      createWorker<SynchronizerWorkerContext>(this.removeFile.bind(this))
    );

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
      SynchronizerService.name
    );

    const isFileExists = Boolean(
      await this.filesRepository.findOneBy({
        absolutePath,
      })
    );

    if (isFileExists) return;

    this.queueManager.addJob(SYNCHRONIZER_CREATE_WORKER_TYPE, {
      absolutePath,
    });
  };

  private onFileDeleted = async (absolutePath: string): Promise<void> => {
    this.logger.log(
      `Deleting the entity was detected: ${absolutePath}`,
      SynchronizerService.name
    );

    this.queueManager.addJob(SYNCHRONIZER_REMOVE_WORKER_TYPE, {
      absolutePath,
    });
  };

  private async addFile(ctx: SynchronizerWorkerContext) {
    const { absolutePath } = ctx;

    const absoluteRootPath = await this.config.getRootPath();

    const fileInfo = await getFileStat(absolutePath);

    if (!fileInfo) return;

    const file = new FileEntity();
    file.name = fileInfo.name;
    file.size = fileInfo.size;
    file.absolutePath = absolutePath;
    file.relativePath = file.absolutePath.replace(absoluteRootPath, "");

    if (fileInfo.absoluteDirPath === absoluteRootPath) {
      await this.filesRepository.save(file);
      return;
    }

    const parentDirectory = await this.getDirectory(fileInfo.absoluteDirPath);

    file.directory = parentDirectory;
    file.directoryUUID = parentDirectory.uuid;

    await this.filesRepository.save(file);

    let currentDirectoryUUID: string | undefined = file.directoryUUID;

    while (currentDirectoryUUID) {
      const directory: DirectoryEntity | null =
        await this.directoriesRepository.findOneBy({
          uuid: currentDirectoryUUID,
        });

      if (!directory) return;

      directory.size += file.size;

      await this.directoriesRepository.save(directory);

      currentDirectoryUUID = directory.parentDirectoryUUID;
    }
  }

  private async removeFile(ctx: SynchronizerWorkerContext) {
    const { absolutePath } = ctx;

    const file = await this.filesRepository.findOneBy({
      absolutePath,
    });

    if (!file) return;

    await this.filesRepository.delete({
      uuid: file.uuid,
    });

    let currentDirectoryUUID = file.directoryUUID;

    while (currentDirectoryUUID) {
      const directory = await this.directoriesRepository.findOneBy({
        uuid: currentDirectoryUUID,
      });

      if (!directory) return;

      directory.size -= file.size;

      if (directory.size === 0)
        await this.directoriesRepository.delete({
          uuid: directory.uuid,
        });
      else await this.directoriesRepository.save(directory);

      currentDirectoryUUID = directory.parentDirectoryUUID;
    }
  }

  private async getDirectory(absoluteDirPath: string) {
    const directory = await this.directoriesRepository.findOneBy({
      absolutePath: absoluteDirPath,
    });

    if (directory) return directory;

    const absoluteRootPath = await this.config.getRootPath();

    const dir = new DirectoryEntity();

    dir.name = basename(absoluteDirPath);
    dir.size = 0;
    dir.absolutePath = absoluteDirPath;
    dir.relativePath = dir.absolutePath.replace(absoluteRootPath, "");

    const parentDirectoryPath = dirname(dir.absolutePath);
    const parentDirectory = await this.directoriesRepository.findOneBy({
      absolutePath: parentDirectoryPath,
    });

    if (parentDirectory) {
      dir.parentDirectoryUUID = parentDirectory.uuid;

      await this.directoriesRepository.save(parentDirectory);
    } else if (parentDirectoryPath !== absoluteRootPath) {
      const parentDirectory = await this.getDirectory(parentDirectoryPath);

      dir.parentDirectoryUUID = parentDirectory.uuid;
    }

    return this.directoriesRepository.save(dir);
  }

  private async deleteUnreachedFiles() {
    const files = await this.filesRepository.find();

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
