import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { FileEntity } from "@/server/db/entities/file.entity";
import { JobEntity } from "@/server/db/entities/job.entity";
import { ReferenceEntity } from "@/server/db/entities/reference.entity";
import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DirectoryService } from "./directory.service";
import { FileService } from "./file.service";
import { ReferenceService } from "./reference.service";
import { StorageController } from "./storage.controller";
import { StorageManager } from "./storage.manager";
import { StorageService } from "./storage.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobEntity,
      DirectoryEntity,
      FileEntity,
      ReferenceEntity,
    ]),
  ],
  controllers: [StorageController],
  providers: [
    Logger,
    DirectoryService,
    FileService,
    ReferenceService,
    StorageManager,
    StorageService,
  ],
  exports: [
    DirectoryService,
    FileService,
    ReferenceService,
    StorageManager,
    StorageService,
  ],
})
export class StorageModule {}
