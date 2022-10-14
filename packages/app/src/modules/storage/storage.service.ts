import { Injectable } from "@nestjs/common";
import { LocalStorage } from "../file-system/local-storage";
import { Entity } from "../file-system/type";
import { Statistics } from "./type";

@Injectable()
export class StorageService {
  constructor(private readonly localStorage: LocalStorage) {}

  async getStatistics(): Promise<Statistics> {
    const files = this.localStorage.getFiles();
    const dirs = this.localStorage.getDirectories();

    const totalFileCount = files.length;
    const totalDirCount = dirs.length;

    let totalSpaceSize = files.reduce((size, file) => size + file.size, 0);

    while (totalSpaceSize > 1024) totalSpaceSize /= 1024;

    return {
      total_dirs_count: totalDirCount,
      total_file_count: totalFileCount,
      total_space_size: totalSpaceSize,
    };
  }

  async getRootEntities(): Promise<Entity[]> {
    return this.localStorage.getRootEntities();
  }
}
