import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { Entity } from "../file-system/type";
import { Statistics } from "./type";
import { InjectRepository } from "@nestjs/typeorm";
import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { IsNull, Repository } from "typeorm";
import { FileEntity } from "@/server/db/entities/file.entity";

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
            directoryUUID: IsNull(),
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
