import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { FileEntity } from "@/server/db/entities/file.entity";
import { JobEntity } from "@/server/db/entities/job.entity";
import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DirectoryService } from "./directory.service";
import { FileService } from "./file.service";
import { StorageController } from "./storage.controller";
import { StorageManager } from "./storage.manager";
import { StorageService } from "./storage.service";

@Module({
  imports: [TypeOrmModule.forFeature([JobEntity, DirectoryEntity, FileEntity])],
  controllers: [StorageController],
  providers: [
    Logger,
    DirectoryService,
    FileService,
    StorageService,
    StorageManager,
  ],
  exports: [DirectoryService, FileService, StorageService, StorageManager],
})
export class StorageModule {}
