import { DirectoryEntity } from "@/server/db/entities/directory.entity";
import { FileEntity } from "@/server/db/entities/file.entity";
import { JobEntity } from "@/server/db/entities/job.entity";
import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "../config/config.module";
import { QueueModule } from "../queue";
import { StorageController } from "./storage.controller";
import { StorageManager } from "./storage.manager";
import { JobsStorage } from "./storage.queue-jobs";
import { StorageService } from "./storage.service";
import { StorageSyncService } from "./storage.sync.service";
import { StorageSyncWorker } from "./storage.sync.worker";
import { WatcherService } from "./watcher.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([JobEntity, DirectoryEntity, FileEntity]),
    ConfigModule,
    QueueModule.registerQueue({
      name: "sync",
      concurrency: 1,
    }),
  ],
  controllers: [StorageController],
  providers: [
    Logger,
    StorageService,
    StorageSyncService,
    StorageSyncWorker,
    StorageManager,
    WatcherService,
  ],
  exports: [
    StorageService,
    StorageSyncService,
    StorageSyncWorker,
    StorageManager,
    WatcherService,
  ],
})
export class StorageModule {}
