import { MetadataEntity } from "@/server/db/entities/metadata.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QueueModule } from "../../queue";
import { MetadataService } from "./metadata.service";
import { WATCHER_QUEUE_NAME } from "./watcher.constants";
import { WatcherService } from "./watcher.service";
import { WatcherWorker } from "./watcher.worker";

@Module({
  imports: [
    TypeOrmModule.forFeature([MetadataEntity]),
    QueueModule.registerQueue({
      name: WATCHER_QUEUE_NAME,
      concurrency: 1,
    }),
  ],
  providers: [WatcherService, MetadataService, WatcherWorker],
  exports: [WatcherService, MetadataService, WatcherWorker],
})
export class WatcherModule {}
