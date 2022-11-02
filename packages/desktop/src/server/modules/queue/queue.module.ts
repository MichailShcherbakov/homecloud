import { JobEntity } from "@/server/db/entities/job.entity";
import { DynamicModule, Logger, Module, Provider, Scope } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QueueModuleOptions } from "./queue.options";
import { QueueExplorer } from "./queue.explorer";
import { DiscoveryModule } from "@nestjs/core";
import { QueueMetadataAccessor } from "./queue.metadata-accessor";
import { createQueueProviders } from "./queue.providers";
import { JobsStorage } from "../storage/storage.queue-jobs";

@Module({})
export class QueueModule {
  static forRoot() {
    return {
      global: true,
      module: QueueModule,
      imports: [TypeOrmModule.forFeature([JobEntity])],
      providers: [Logger, JobsStorage],
      exports: [JobsStorage],
    };
  }

  static registerQueue(options: QueueModuleOptions): DynamicModule {
    const queueProviders = createQueueProviders(options);
    return {
      module: QueueModule,
      imports: [QueueModule.registerCore()],
      providers: queueProviders,
      exports: queueProviders,
    };
  }

  private static registerCore() {
    return {
      global: true,
      module: QueueModule,
      imports: [DiscoveryModule],
      providers: [Logger, QueueExplorer, QueueMetadataAccessor],
      exports: [QueueExplorer, QueueMetadataAccessor],
    };
  }
}
