import { Logger, Module } from "@nestjs/common";
import { FileSystemModule, WatcherModule } from "../file-system";
import { QueueModule } from "../queue";
import { StorageModule } from "../storage";
import { SYNC_QUEUE_NAME } from "./constants";
import { SyncFileSystemService } from "./sync.fs.service";
import { SyncStorageService } from "./sync.storage.service";
import { SyncWorker } from "./sync.worker";

@Module({
  imports: [
    StorageModule,
    FileSystemModule,
    WatcherModule,
    QueueModule.registerQueue({
      name: SYNC_QUEUE_NAME,
      concurrency: 1,
    }),
  ],
  providers: [Logger, SyncFileSystemService, SyncStorageService, SyncWorker],
  exports: [SyncFileSystemService, SyncStorageService, SyncWorker],
})
export class SyncModule {}
