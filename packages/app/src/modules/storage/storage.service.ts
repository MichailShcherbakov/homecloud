import { Injectable } from "@nestjs/common";
import { FileSystemService } from "../file-system/file-system.service";
import { Entity } from "../file-system/type";
import { Statistics } from "./type";

const TEMP_DIR_LOCATION = "C:/Users/Michail/Downloads/homecloud";

@Injectable()
export class StorageService {
  constructor(private readonly fileSystemService: FileSystemService) {}

  async getStatistics(): Promise<Statistics> {
    const entities = await this.fileSystemService.readDir(TEMP_DIR_LOCATION);
    const files = entities.filter(e => e.isFile);

    const totalFileCount = files.length;
    const totalDirCount = entities.filter(e => e.isDirectory).length;

    let totalSpaceSize = files.reduce((size, file) => size + file.size, 0);

    while (totalSpaceSize > 1024) totalSpaceSize /= 1024;

    return {
      total_dirs_count: totalDirCount,
      total_file_count: totalFileCount,
      total_space_size: totalSpaceSize,
    };
  }

  async getRootEntities(): Promise<Entity[]> {
    return this.fileSystemService.readDir(TEMP_DIR_LOCATION);
  }
}
