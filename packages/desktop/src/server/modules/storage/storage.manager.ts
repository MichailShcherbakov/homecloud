import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { FileEntity } from "@/server/db/entities/file.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class StorageManager {
  constructor(
    @InjectRepository(DirectoryEntity)
    private readonly directoriesRepository: Repository<DirectoryEntity>,
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
    private readonly emitter: EventEmitter2
  ) {}

  findOneDirectoryByUuid(uuid: string) {
    return this.directoriesRepository.findOneBy({
      uuid,
    });
  }

  findOneDirectoryByAbsolutePath(absolutePath: string) {
    return this.directoriesRepository.findOneBy({
      absolutePath,
    });
  }

  async deleteDirectoryByUuid(uuid: string) {
    const dir = await this.findOneDirectoryByUuid(uuid);

    if (!dir) return;

    this.emitter.emit("storage.remove_dir", dir);

    return this.directoriesRepository.delete({
      uuid,
    });
  }

  async saveDirectory(directory: DirectoryEntity) {
    const newDir = await this.directoriesRepository.save(directory);

    this.emitter.emit("storage.add_dir", newDir);

    return newDir;
  }

  findFiles() {
    return this.filesRepository.find();
  }

  findOneFileByUuid(uuid: string) {
    return this.filesRepository.findOneBy({
      uuid,
    });
  }

  findOneFileByAbsolutePath(absolutePath: string) {
    return this.filesRepository.findOneBy({
      absolutePath,
    });
  }

  async deleteFileByUuid(uuid: string) {
    const file = await this.findOneFileByUuid(uuid);

    if (!file) return;

    this.emitter.emit("storage.remove_file", file);

    return this.filesRepository.delete({
      uuid,
    });
  }

  async saveFile(file: FileEntity) {
    const newFile = await this.filesRepository.save(file);

    this.emitter.emit("storage.add_file", newFile);

    return newFile;
  }
}
