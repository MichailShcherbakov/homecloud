import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { Entity } from "../file-system/type";
import { Statistics } from "./type";
import { InjectRepository } from "@nestjs/typeorm";
import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { In, IsNull, Repository } from "typeorm";
import { FileEntity } from "@/server/db/entities/file.entity";
import { WatcherService } from "./watcher.service";
import { getFileStat } from "@/server/utils/getFileStat";
import { getDirName } from "@/server/utils/getDirName";
import { dirname } from "path";
import { access } from "@/server/utils/access";

@Injectable()
export class StorageService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigService,
    @InjectRepository(DirectoryEntity)
    private readonly directoriesRepository: Repository<DirectoryEntity>,
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
    private readonly watcherService: WatcherService
  ) {}

  async onModuleInit() {
    /* const absoluteRootPath = await this.config.getRootPath();

    await Promise.all([
      this.deleteUnreachedFiles(),
      this.deleteUnreachedDirectories(),
    ]);

    this.watcherService.watch(absoluteRootPath, {
      ignored: /(.+)\.media\/(.+)/,
    });

    this.watcherService.on(absoluteRootPath, "add", this.onFileDetected);
    this.watcherService.on(absoluteRootPath, "unlink", this.onFileDeleted); */
  }

  async onModuleDestroy() {
    /* const absoluteRootPath = await this.config.getRootPath();

    this.watcherService.off(absoluteRootPath, "unlink", this.onFileDeleted);
    this.watcherService.off(absoluteRootPath, "add", this.onFileDetected);

    this.watcherService.unwatch(absoluteRootPath); */
  }

  /* private onFileDetected = async (absolutePath: string): Promise<void> => {
    const absoluteRootPath = await this.config.getRootPath();

    this.logger.log(
      `The entity was detected: ${absolutePath}`,
      StorageService.name
    );

    const isFileExists = Boolean(
      await this.filesRepository.findOneBy({
        absolutePath,
      })
    );

    if (isFileExists) return;

    const fileStat = await getFileStat(absolutePath);

    if (!fileStat) return;

    const file = new FileEntity();
    file.name = fileStat.name;
    file.size = fileStat.size;
    file.absolutePath = absolutePath;
    file.relativePath = file.absolutePath.replace(absoluteRootPath, "");

    if (fileStat.absoluteDirPath === absoluteRootPath) {
      await this.filesRepository.save(file);
      return;
    }

    const createDir = async (absoluteDirPath: string, size: number) => {
      const dir = new DirectoryEntity();

      dir.name = getDirName(absoluteDirPath);
      dir.size = size;
      dir.absolutePath = absoluteDirPath;
      dir.relativePath = dir.absolutePath.replace(absoluteRootPath, "");

      const parentDirectoryPath = dirname(dir.absolutePath);
      const parentDirectory = await this.directoriesRepository.findOneBy({
        absolutePath: parentDirectoryPath,
      });

      if (parentDirectory) {
        dir.parentDirectory = parentDirectory;
        dir.parentDirectoryUUID = parentDirectory.uuid;

        parentDirectory.size += dir.size;

        await this.directoriesRepository.save(parentDirectory);
      } else if (parentDirectoryPath !== absoluteRootPath) {
        const parentDirectory = await createDir(parentDirectoryPath, dir.size);

        dir.parentDirectory = parentDirectory;
        dir.parentDirectoryUUID = parentDirectory.uuid;
      }

      return this.directoriesRepository.save(dir);
    };

    const parentDirectory = await createDir(
      fileStat.absoluteDirPath,
      file.size
    );

    file.directory = parentDirectory;
    file.directoryUUID = parentDirectory.uuid;

    await this.filesRepository.save(file);
  }; */

  /*  private onFileDeleted = async (absolutePath: string): Promise<void> => {
    this.logger.log(`Deleting the entity was detected`, StorageService.name);

    const file = await this.filesRepository.findOneBy({
      absolutePath,
    });

    if (!file) return;

    await this.filesRepository.delete({
      uuid: file.uuid,
    });

    if (!file.directoryUUID) return;

    const parentDirectory = await this.directoriesRepository.findOneBy({
      uuid: file.directoryUUID,
    });

    if (!parentDirectory) return;

    parentDirectory.size -= file.size;

    if (parentDirectory.size === 0)
      await this.directoriesRepository.delete({
        uuid: parentDirectory.uuid,
      });
    else await this.directoriesRepository.save(parentDirectory);
  }; */

  private async deleteUnreachedDirectories() {
    const directories = await this.directoriesRepository.find();

    const unreachedDirectories = (
      await Promise.all(
        directories.map(d =>
          access(d.absolutePath).then(isDeleted => ({
            ...d,
            isDeleted,
          }))
        )
      )
    ).filter(d => d.isDeleted);

    await this.directoriesRepository.delete({
      uuid: In(unreachedDirectories.map(d => d.uuid)),
    });
  }

  private async deleteUnreachedFiles() {
    const files = await this.filesRepository.find();

    const unreachedFiles = (
      await Promise.all(
        files.map(f =>
          access(f.absolutePath).then(isDeleted => ({
            ...f,
            isDeleted,
          }))
        )
      )
    ).filter(f => f.isDeleted);

    await Promise.all(
      unreachedFiles.map(d => {
        if (!d.directoryUUID) return;

        return this.directoriesRepository.decrement(
          {
            uuid: d.directoryUUID,
          },
          "size",
          d.size
        );
      })
    );

    await this.filesRepository.delete({
      uuid: In(unreachedFiles.map(f => f.uuid)),
    });
  }

  async getStatistics(): Promise<Statistics> {
    const [filesCount, dirsCount] = await Promise.all([
      this.filesRepository.count(),
      this.directoriesRepository.count(),
      this.directoriesRepository
        .find({
          where: {
            parentDirectoryUUID: IsNull(),
          },
        })
        .then(dirs => dirs.reduce((size, dir) => size + dir.size, 0)),
      this.filesRepository
        .find({
          where: {
            directoryUUID: IsNull(),
          },
        })
        .then(files => files.reduce((size, file) => size + file.size, 0)),
    ]);

    return {
      directories: {
        size: 0,
        count: dirsCount,
      },
      files: {
        size: 0,
        count: filesCount,
      },
      storage: {
        size: 0,
      },
    };
  }

  async getRootEntities(): Promise<Entity[]> {
    return [];
  }

  async getDirEntities(uuid: string): Promise<Entity[]> {
    return [];
  }

  async getGlobaFilePath(uuid: string): Promise<string> {
    throw new NotFoundException("The file not found");
  }
}
