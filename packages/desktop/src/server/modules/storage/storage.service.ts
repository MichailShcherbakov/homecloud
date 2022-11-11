import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { Statistics } from "./storage.type";
import { InjectRepository } from "@nestjs/typeorm";
import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { In, IsNull, Repository } from "typeorm";
import { FileEntity } from "@/server/db/entities/file.entity";
import { join, parse } from "path";
import { JobsStorage } from "../queue/queue.storage";
import { fromJSON } from "@/server/utils/format/json";
import { StorageManager } from "./storage.manager";
import { UploadDto } from "./storage.dto";
import { computeFileHash } from "@/server/utils/fs/computeFileHash";

@Injectable()
export class StorageService {
  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigService,
    private readonly storageManager: StorageManager,
    private readonly jobStorage: JobsStorage
  ) {}

  async getStatistics(): Promise<Statistics> {
    const [filesCount, dirsCount, filesSize, dirsSize] = await Promise.all([
      this.storageManager.getFilesCount(),
      this.storageManager.getDirectoriesCount(),
      this.storageManager
        .getRootFiles()
        .then(files => files.reduce((size, f) => size + f.size, BigInt(0))),
      this.storageManager
        .getRootDirectories()
        .then(dirs => dirs.reduce((size, d) => size + d.size, BigInt(0))),
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
    const directory = uuid
      ? await this.storageManager.getDirectoryByUuid(uuid)
      : null;

    const [dirs, files] = await Promise.all([
      directory
        ? this.storageManager.getDirectoriesIn(directory)
        : this.storageManager.getRootDirectories(),
      directory
        ? this.storageManager.getFilesIn(directory)
        : this.storageManager.getRootFiles(),
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

  async getGlobalFilePath(uuid: string): Promise<string> {
    /*  const rootPath = this.config.getAbsoluteRootPath();
    const file = await this.storageManager.getFileByUuid(uuid);

    if (!file) throw new NotFoundException(`The file was not found: ${uuid}`);

    const raw = parse(file.relativePath);

    return join(rootPath, ".media", raw.dir, raw.name, `${raw.name}.m3u8`); */

    return "";
  }

  async getAncestorsDirectory(uuid: string): Promise<DirectoryEntity[]> {
    const directory = await this.storageManager.getDirectoryByUuid(uuid);

    if (!directory) return [];

    return this.storageManager.getAncestorsDirectory(directory);
  }

  async getUploadEntities(): Promise<(DirectoryEntity | FileEntity)[]> {
    /*  const converterProcessingJobs = await this.jobStorage.getProcessingJobs({
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
    }); */

    return [];
  }

  async upload(
    options: UploadDto & {
      files: Array<Express.Multer.File>;
    }
  ): Promise<void> {
    const { files, destination } = options;

    const destDirectory = destination?.uuid
      ? await this.storageManager.getDirectoryByUuid(destination.uuid)
      : null;

    await Promise.all(
      files.map(async f => {
        const fileEntity = new FileEntity();
        fileEntity.uuid = f.filename;
        fileEntity.name = f.originalname;
        fileEntity.hash = await computeFileHash(f.path);
        fileEntity.size = BigInt(f.size);
        return this.storageManager.createFile(fileEntity, destDirectory);
      })
    );
  }
}
