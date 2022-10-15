import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { LocalStorage } from "../file-system/local-storage";
import { Entity } from "../file-system/type";
import { Statistics } from "./type";
import { join } from "path";

@Injectable()
export class StorageService {
  constructor(
    private readonly configService: ConfigService,
    private readonly localStorage: LocalStorage
  ) {}

  async getStatistics(): Promise<Statistics> {
    const files = this.localStorage.getFiles();
    const dirs = this.localStorage.getDirectories();

    const totalFileCount = files.length;
    const totalDirCount = dirs.length;
    const totalSpaceSize = files.reduce((size, file) => size + file.size, 0);

    return {
      total_dirs_count: totalDirCount,
      total_file_count: totalFileCount,
      total_space_size: totalSpaceSize,
    };
  }

  async getRootEntities(): Promise<Entity[]> {
    return this.localStorage.getRootEntities();
  }

  async getDirEntities(uuid: string): Promise<Entity[]> {
    return this.localStorage.getDirectoryEntities(uuid);
  }

  async getGlobaFilePath(uuid: string): Promise<string> {
    const file = this.localStorage.getFile(uuid);

    if (!file) throw new NotFoundException("The file not found");

    const rootPath = this.configService.get("path", "root");

    return join(rootPath, file.path);
  }
}
