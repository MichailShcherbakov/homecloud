import {
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { Entity, File, Directory } from "./type";
import { readDir } from "@server/utils/read-dir";
import { join, extname } from "path";
import chokidar from "chokidar";
import { accessSync } from "@server/utils/access";
import { mkdirSync } from "fs";

@Injectable()
export class LocalStorage implements OnModuleInit, OnModuleDestroy {
  private watcher: chokidar.FSWatcher;
  private entities: Entity[] = [];

  constructor(private readonly config: ConfigService) {
    const rootPath = this.config.getRootPath();
    const mediaPath = join(rootPath, ".media");

    if (!accessSync(mediaPath)) mkdirSync(mediaPath, { recursive: true });

    this.watcher = chokidar.watch(mediaPath);
  }

  async onModuleInit() {
    const rootPath = this.config.getRootPath();
    const mediaPath = join(rootPath, ".media");

    this.watcher.on("add", async globalPath => {
      const ext = extname(globalPath);

      if (ext !== ".m3u8") return;

      this.entities = await readDir(mediaPath, {
        includeExts: [".m3u8"],
        collapseFolders: true,
        collapseExt: ".m3u8",
      });
    });

    this.watcher.on("unlink", async globalPath => {
      const ext = extname(globalPath);

      if (ext !== ".m3u8") return;

      this.entities = await readDir(mediaPath, {
        includeExts: [".m3u8"],
        collapseFolders: true,
        collapseExt: ".m3u8",
      });
    });

    this.entities = await readDir(mediaPath, {
      includeExts: [".m3u8"],
      collapseFolders: true,
      collapseExt: ".m3u8",
    });
  }

  onModuleDestroy() {
    this.entities = [];
  }

  getEntities(): Entity[] {
    return this.entities;
  }

  getFiles(): File[] {
    return this.entities.filter(e => e.isFile) as File[];
  }

  getDirectories(): Directory[] {
    return this.entities.filter(e => e.isDirectory) as Directory[];
  }

  getRootEntities(): Entity[] {
    return this.entities.filter(e => !e.parentDirUuid);
  }

  getEntity(uuid: string): Entity | null {
    return this.entities.find(e => e.uuid === uuid) ?? null;
  }

  getDirectory(uuid: string): Directory | null {
    const entity = this.getEntity(uuid);
    return entity?.isDirectory ? (entity as Directory) : null;
  }

  getFile(uuid: string): File | null {
    const entity = this.getEntity(uuid);
    return entity?.isFile ? (entity as File) : null;
  }

  getDirectoryEntities(uuid: string): Entity[] {
    const directory = this.getDirectory(uuid);

    if (!directory) throw new NotFoundException("The directory not found");

    return this.entities.filter(e => e.parentDirUuid === directory.uuid);
  }
}
