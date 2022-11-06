import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { FileEntity } from "@/server/db/entities/file.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ConfigService } from "../config/config.service";

@Injectable()
export class StorageManager {
  constructor(
    private readonly config: ConfigService,
    private readonly emitter: EventEmitter2,
    @InjectRepository(DirectoryEntity)
    private readonly directoriesRepository: Repository<DirectoryEntity>,
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>
  ) {}

  public getDirectoryByUuid(uuid: string) {
    return this.directoriesRepository.findOneBy({
      uuid,
    });
  }

  public getDirectoryByAbsolutePath(absolutePath: string) {
    return this.directoriesRepository.findOneBy({
      absolutePath,
    });
  }

  public async deleteDirectoryByUuid(uuid: string) {
    const dir = await this.getDirectoryByUuid(uuid);

    if (!dir) throw new Error(`The directory was not found: ${uuid}`);

    await this.directoriesRepository.delete({
      uuid,
    });

    this.emitter.emit("storage.remove_dir", dir);
  }

  public async saveDirectory(directory: DirectoryEntity) {
    const newDir = await this.directoriesRepository.save(directory);

    this.emitter.emit("storage.add_dir", newDir);

    return newDir;
  }

  public getFiles() {
    return this.filesRepository.find();
  }

  public getFileByUuid(uuid: string) {
    return this.filesRepository.findOneBy({
      uuid,
    });
  }

  public getFileByAbsolutePath(absolutePath: string) {
    return this.filesRepository.findOneBy({
      absolutePath,
    });
  }

  public async deleteFileByUuid(uuid: string) {
    const file = await this.getFileByUuid(uuid);

    if (!file) throw new Error(`The file was not found: ${uuid}`);

    await this.filesRepository.delete({
      uuid,
    });

    let currentDirectoryUUID = file.parentDirectoryUUID;

    while (currentDirectoryUUID) {
      const directory = await this.getDirectoryByUuid(currentDirectoryUUID);

      if (!directory) break;

      directory.size -= file.size;

      await this.saveDirectory(directory);

      currentDirectoryUUID = directory.parentDirectoryUUID;
    }

    this.emitter.emit("storage.remove_file", file);
  }

  public async saveFile(file: FileEntity) {
    const newFile = await this.filesRepository.save(file);

    let currentDirectoryUUID = file.parentDirectoryUUID;

    while (currentDirectoryUUID) {
      const directory = await this.getDirectoryByUuid(currentDirectoryUUID);

      if (!directory) break;

      directory.size += file.size;

      await this.saveDirectory(directory);

      currentDirectoryUUID = directory.parentDirectoryUUID;
    }

    this.emitter.emit("storage.add_file", newFile);

    return newFile;
  }

  /* public async getDirectoryByAbsolutePath(
    absoluteDirPath: string
  ): Promise<DirectoryEntity> {
    const directory = await this.findOneDirectoryByAbsolutePath(
      absoluteDirPath
    );

    if (directory) return directory;

    const absoluteRootPath = await this.config.getAbsoluteRootPath();

    const dir = new DirectoryEntity();

    dir.name = basename(absoluteDirPath);
    dir.size = 0;
    dir.absolutePath = absoluteDirPath;
    dir.relativePath = dir.absolutePath.replace(absoluteRootPath, "");

    const parentDirectoryPath = dirname(dir.absolutePath);
    const parentDirectory = await this.findOneDirectoryByAbsolutePath(
      parentDirectoryPath
    );

    if (parentDirectory) {
      dir.parentDirectoryUUID = parentDirectory.uuid;

      await this.saveDirectory(parentDirectory);
    } else if (parentDirectoryPath !== absoluteRootPath) {
      const parentDirectory = await this.getDirectoryByAbsolutePath(
        parentDirectoryPath
      );

      dir.parentDirectoryUUID = parentDirectory.uuid;
    }

    return this.saveDirectory(dir);
  } */
}
