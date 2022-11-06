import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { FileEntity } from "@/server/db/entities/file.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ConfigService } from "../config/config.service";
import { basename, dirname } from "path";

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

  public findOneDirectoryByUuid(uuid: string) {
    return this.directoriesRepository.findOneBy({
      uuid,
    });
  }

  public findOneDirectoryByAbsolutePath(absolutePath: string) {
    return this.directoriesRepository.findOneBy({
      absolutePath,
    });
  }

  public async deleteDirectoryByUuid(uuid: string) {
    const dir = await this.findOneDirectoryByUuid(uuid);

    if (!dir) return;

    this.emitter.emit("storage.remove_dir", dir);

    return this.directoriesRepository.delete({
      uuid,
    });
  }

  public async saveDirectory(directory: DirectoryEntity) {
    const newDir = await this.directoriesRepository.save(directory);

    this.emitter.emit("storage.add_dir", newDir);

    return newDir;
  }

  public findFiles() {
    return this.filesRepository.find();
  }

  public findOneFileByUuid(uuid: string) {
    return this.filesRepository.findOneBy({
      uuid,
    });
  }

  public findOneFileByAbsolutePath(absolutePath: string) {
    return this.filesRepository.findOneBy({
      absolutePath,
    });
  }

  public async deleteFileByUuid(uuid: string) {
    const file = await this.findOneFileByUuid(uuid);

    if (!file) return;

    this.emitter.emit("storage.remove_file", file);

    return this.filesRepository.delete({
      uuid,
    });
  }

  public async saveFile(file: FileEntity) {
    const newFile = await this.filesRepository.save(file);

    let currentDirectoryUUID: string | undefined = file.parentDirectoryUUID;

    while (currentDirectoryUUID) {
      const directory: DirectoryEntity | null =
        await this.findOneDirectoryByUuid(currentDirectoryUUID);

      if (!directory)
        throw new Error(`The directory was not found: ${currentDirectoryUUID}`);

      directory.size += file.size;

      await this.saveDirectory(directory);

      currentDirectoryUUID = directory.parentDirectoryUUID;
    }

    this.emitter.emit("storage.add_file", newFile);

    return newFile;
  }

  public async getDirectoryByAbsolutePath(
    absoluteDirPath: string
  ): Promise<DirectoryEntity> {
    const directory = await this.findOneDirectoryByAbsolutePath(
      absoluteDirPath
    );

    if (directory) return directory;

    const absoluteRootPath = await this.config.getRootPath();

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
  }
}
