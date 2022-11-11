import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ReferenceEntity } from "@/server/db/entities/reference.entity";
import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { FileEntity } from "@/server/db/entities/file.entity";
import { MetadataEntity } from "@/server/db/entities/metadata.entity";
import { toJSON } from "@/server/utils/format";

/**
 * @private
 */
@Injectable()
export class ReferenceService {
  constructor(
    @InjectRepository(ReferenceEntity)
    private readonly referenceRepository: Repository<ReferenceEntity>
  ) {}

  /**
   * @param entity
   * @param metadata
   * @returns ref
   */
  public createRef<TEntity extends DirectoryEntity | FileEntity>(
    entity: TEntity,
    metadata: MetadataEntity
  ): Promise<ReferenceEntity> {
    if (!(entity instanceof DirectoryEntity) && !(entity instanceof FileEntity))
      throw new Error(
        `The entity should be DirectoryEntity or FileEntity, but it's : ${typeof entity}`
      );

    return this.referenceRepository.save({
      directory: entity instanceof DirectoryEntity ? entity : null,
      file: entity instanceof FileEntity ? entity : null,
      metadata,
    });
  }

  /**
   * @param uuid
   * @returns ref or null
   */
  public getRefByUuid(uuid: string): Promise<ReferenceEntity | null> {
    return this.referenceRepository.findOne({
      where: {
        uuid,
      },
      relations: {
        directory: true,
        file: true,
        metadata: true,
      },
    });
  }

  /**
   * @param entity
   * @returns ref or null
   */
  public getRefByEntity<TEntity extends DirectoryEntity | FileEntity>(
    entity: TEntity
  ): Promise<ReferenceEntity | null> {
    if (!(entity instanceof DirectoryEntity) && !(entity instanceof FileEntity))
      throw new Error(
        `The entity should be DirectoryEntity or FileEntity, but it's : ${typeof entity}`
      );

    return this.referenceRepository.findOne({
      where: {
        directoryUuid:
          entity instanceof DirectoryEntity ? entity.uuid : undefined,
        fileUuid: entity instanceof FileEntity ? entity.uuid : undefined,
      },
      relations: {
        directory: true,
        file: true,
        metadata: true,
      },
    });
  }

  /**
   *
   * @param metadata
   * @returns ref or null
   */
  public getRefByMetadata(
    metadata: MetadataEntity
  ): Promise<ReferenceEntity | null> {
    return this.referenceRepository.findOne({
      where: {
        metadataUuid: metadata.uuid,
      },
      relations: {
        directory: true,
        file: true,
        metadata: true,
      },
    });
  }

  /**
   *
   * @param metadata
   * @returns ref or null
   */
  public async getRefByMetadataOrFail(
    metadata: MetadataEntity
  ): Promise<ReferenceEntity> {
    const ref = await this.getRefByMetadata(metadata);

    if (!ref) throw new Error(`The ref was not found: ${toJSON(metadata)}`);

    return ref;
  }

  /**
   * @param uuid
   * @returns ref
   */
  public async deleteRefByUuid(uuid: string): Promise<ReferenceEntity> {
    const foundRef = await this.getRefByUuid(uuid);

    if (!foundRef) throw new Error(`The reference was not found: ${uuid}`);

    await this.referenceRepository.delete({
      uuid,
    });

    return foundRef;
  }
}
