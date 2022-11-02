import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { Statistics } from "./type";
import { InjectRepository } from "@nestjs/typeorm";
import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { IsNull, Repository } from "typeorm";
import { FileEntity } from "@/server/db/entities/file.entity";
import { join, parse } from "path";

@Injectable()
export class StorageService {
  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigService,
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
    const [dirs, files] = await Promise.all([
      this.directoriesRepository.findBy({
        parentDirectoryUUID: IsNull(),
      }),
      this.filesRepository.findBy({
        parentDirectoryUUID: IsNull(),
      }),
    ]);

    return [...dirs, ...files];
  }

  async getDirEntities(
    uuid: string
  ): Promise<(DirectoryEntity | FileEntity)[]> {
    const [dirs, files] = await Promise.all([
      this.directoriesRepository.findBy({
        parentDirectoryUUID: uuid,
      }),
      this.filesRepository.findBy({
        parentDirectoryUUID: uuid,
      }),
    ]);

    return [...dirs, ...files];
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
}
