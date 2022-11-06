import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { Statistics } from "./type";
import { InjectRepository } from "@nestjs/typeorm";
import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { In, IsNull, Repository } from "typeorm";
import { FileEntity } from "@/server/db/entities/file.entity";
import { join, parse } from "path";
import { JobsStorage } from "./storage.queue-jobs";
import { fromJSON } from "@/server/utils/json";
import { rename } from "fs/promises";
import { StorageManager } from "./storage.manager";

@Injectable()
export class StorageService {
  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigService,
    private readonly storageManager: StorageManager,
    private readonly jobStorage: JobsStorage,
    @InjectRepository(DirectoryEntity)
    private readonly directoriesRepository: Repository<DirectoryEntity>,
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>
  ) {}

  async getStatistics(): Promise<Statistics> {
    const [filesCount, dirsCount, filesSize, dirsSize] = await Promise.all([
      this.filesRepository.count(),
      this.directoriesRepository.count(),
      this.filesRepository
        .find({
          where: {
            parentDirectoryUUID: IsNull(),
          },
        })
        .then(files => files.reduce((size, f) => size + f.size, 0)),
      this.directoriesRepository
        .find({
          where: {
            parentDirectoryUUID: IsNull(),
          },
        })
        .then(dirs => dirs.reduce((size, d) => size + d.size, 0)),
    ]);

    return {
      directories: {
        size: dirsSize,
        count: dirsCount,
      },
      files: {
        size: filesSize,
        count: filesCount,
      },
      storage: {
        size: filesSize,
      },
    };
  }

  async getRootEntities(): Promise<(DirectoryEntity | FileEntity)[]> {
    return this.getDirEntities();
  }

  async getDirEntities(
    uuid?: string
  ): Promise<(DirectoryEntity | FileEntity)[]> {
    const [dirs, files] = await Promise.all([
      this.directoriesRepository.findBy({
        parentDirectoryUUID: uuid ? uuid : IsNull(),
      }),
      this.filesRepository.findBy({
        parentDirectoryUUID: uuid ? uuid : IsNull(),
      }),
    ]);

    const converterProcessingJobs = await this.jobStorage.getProcessingJobs({
      processorName: "converter",
    });

    const uploadFilesUuids = new Set(
      converterProcessingJobs.map(j => (fromJSON(j.data) as any)?.file?.uuid)
    );

    return [
      ...dirs.map(d => ({ ...d, isDirectory: true })),
      ...files.map(f => ({
        ...f,
        isFile: true,
        isUploading: uploadFilesUuids.has(f.uuid),
      })),
    ];
  }

  async getGlobaFilePath(uuid: string): Promise<string> {
    const rootPath = await this.config.getRootPath();
    const file = await this.filesRepository.findOneBy({
      uuid,
    });

    if (!file) throw new NotFoundException(`The file was not found: ${uuid}`);

    const raw = parse(file.relativePath);

    return join(rootPath, ".media", raw.dir, raw.name, `${raw.name}.m3u8`);
  }

  async getPathToDir(uuid: string): Promise<DirectoryEntity[]> {
    let currentDirUuid: string | undefined = uuid;
    const dirs: DirectoryEntity[] = [];

    while (currentDirUuid) {
      const dir: DirectoryEntity | null =
        await this.directoriesRepository.findOneBy({
          uuid: currentDirUuid,
        });

      if (!dir) break;

      dirs.unshift(dir);

      currentDirUuid = dir.parentDirectoryUUID;
    }

    return dirs;
  }

  async getUploadEntities(): Promise<(DirectoryEntity | FileEntity)[]> {
    const converterProcessingJobs = await this.jobStorage.getProcessingJobs({
      processorName: "converter",
    });

    const uploadFilesUuids = converterProcessingJobs.map(
      j => (fromJSON(j.data) as any)?.file?.uuid
    );

    return this.filesRepository.find({
      where: {
        uuid: In(uploadFilesUuids),
      },
      relations: {
        parentDirectory: true,
      },
    });
  }

  async uploadEntity(options: {
    file?: Express.Multer.File;
    targetUUID: string;
    destinationUUID?: string;
  }): Promise<void> {
    const { file, targetUUID, destinationUUID } = options;

    const absoluteRootPath = await this.config.getRootPath();

    const destinationDirectory = destinationUUID
      ? await this.directoriesRepository.findOneBy({
          uuid: destinationUUID,
        })
      : null;

    if (file) {
      const absolutePath =
        destinationDirectory?.absolutePath ?? absoluteRootPath;

      await rename(file.path, absolutePath);
    } else if (targetUUID) {
      const [targetFile, targetDir] = await Promise.all([
        this.filesRepository.findOneBy({ uuid: targetUUID }),
        this.directoriesRepository.findOneBy({ uuid: targetUUID }),
      ]);

      const target = targetFile ?? targetDir;

      if (!target)
        throw new NotFoundException(`The target entity was not found`);

      target.parentDirectory = destinationDirectory ?? undefined;
      target.parentDirectoryUUID = destinationDirectory?.uuid;

      if (targetDir) await this.storageManager.saveDirectory(target);
      else if (targetFile) await this.storageManager.saveFile(target);
    }
  }
}
