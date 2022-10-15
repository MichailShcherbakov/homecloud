import {
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { Entity, File, Directory } from "./type";
import { deepReadDir } from "./utils/deep-read-dir";

@Injectable()
export class LocalStorage implements OnModuleInit, OnModuleDestroy {
  private entities: Entity[] = [];

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const rootPath = this.configService.get("path", "root");

    this.entities = await deepReadDir(rootPath);
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
