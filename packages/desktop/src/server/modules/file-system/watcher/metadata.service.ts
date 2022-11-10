import { MetadataEntity } from "@/server/db/entities/metadata.entity";
import { Injectable } from "@nestjs/common";
import { Like, Repository } from "typeorm";
import * as fs from "fs/promises";
import { InjectRepository } from "@nestjs/typeorm";
import { join } from "path";

@Injectable()
export class MetadataService {
  constructor(
    @InjectRepository(MetadataEntity)
    private readonly metadataRepository: Repository<MetadataEntity>
  ) {}

  async set(path: string): Promise<MetadataEntity> {
    const stat = await fs.stat(path, { bigint: true });

    const metadata = new MetadataEntity();
    metadata.path = path;
    metadata.isFile = stat.isFile();
    metadata.isDirectory = stat.isDirectory();
    metadata.ino = stat.ino.toString();

    return this.metadataRepository.save(metadata);
  }

  get(path: string): Promise<MetadataEntity | null> {
    return this.metadataRepository.findOneBy({ path });
  }

  async delete(path: string): Promise<MetadataEntity> {
    const metadata = await this.get(path);

    if (!metadata) throw new Error(`The metadata was not found: ${path}`);

    /// delete the metadata
    await this.metadataRepository.delete({
      path,
    });

    /// delete the descendants
    await this.metadataRepository.delete({
      path: Like(`${path}/%`),
    });

    return metadata;
  }

  async update(oldPath: string, newPath: string): Promise<MetadataEntity> {
    const metadata = await this.get(oldPath);

    if (!metadata) throw new Error(`The metadata was not found: ${oldPath}`);

    metadata.path = newPath;

    const descendants = await this.metadataRepository.findBy({
      path: Like(`${oldPath}/%`),
    });

    await this.metadataRepository.save([
      metadata,
      ...descendants.map(d => ({
        ...d,
        path: join(newPath, d.path.replace(oldPath, "")),
      })),
    ]);

    return metadata;
  }
}
