import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { FileEntity } from "@/server/db/entities/file.entity";
import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "../config/config.module";
import { FileSystemModule } from "../file-system/file-system.module";
import { QueueModule } from "../queue";
import { StorageController } from "./storage.controller";
import { StorageService } from "./storage.service";
import { SynchronizerService } from "./synchronizer.service";
import { WatcherService } from "./watcher.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([DirectoryEntity, FileEntity]),
    ConfigModule,
    QueueModule,
  ],
  controllers: [StorageController],
  providers: [Logger, StorageService, SynchronizerService, WatcherService],
  exports: [StorageService],
})
export class StorageModule {}
