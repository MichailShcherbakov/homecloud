import { fromJSON } from "@/server/utils/format/json";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { DiscoveryService, MetadataScanner, ModuleRef } from "@nestjs/core";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { Queue } from "./queue";
import { IQueueJobsStorage, Job } from "./queue.job";
import { QueueMetadataAccessor } from "./queue.metadata-accessor";
import { getQueueToken } from "./utils/get-queue-token";

@Injectable()
export class QueueExplorer implements OnModuleInit {
  constructor(
    private readonly logger: Logger,
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: QueueMetadataAccessor,
    private readonly metadataScanner: MetadataScanner
  ) {}

  async onModuleInit() {
    await this.explore();
  }

  private async explore() {
    const providers = this.discoveryService.getProviders();
    const processors = providers.filter((wrapper: InstanceWrapper) =>
      this.metadataAccessor.isProcessor(
        !wrapper.metatype || wrapper.inject
          ? wrapper.instance?.constructor
          : wrapper.metatype
      )
    );
    const storage = providers.find((wrapper: InstanceWrapper) =>
      this.metadataAccessor.isStorage(
        !wrapper.metatype || wrapper.inject
          ? wrapper.instance?.constructor
          : wrapper.metatype
      )
    )?.instance as IQueueJobsStorage | undefined;

    const queues = new Map<string, Queue>();

    processors.forEach((wrapper: InstanceWrapper) => {
      const { instance, metatype } = wrapper;
      const { name: queueName } = this.metadataAccessor.getProcessorMetadata(
        instance.constructor || metatype
      );

      const queueToken = getQueueToken(queueName);
      const queue = this.getQueue(queueToken, queueName);

      if (!queues.has(queueToken)) queues.set(queueToken, queue);

      if (storage) queue.setStorage(storage);

      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key: string) => {
          if (this.metadataAccessor.isProcess(instance[key])) {
            const metadata = this.metadataAccessor.getProcessMetadata(
              instance[key]
            );

            queue.addProcessor(metadata.name, instance[key].bind(instance));
          } else if (this.metadataAccessor.isListener(instance[key])) {
            const metadata = this.metadataAccessor.getListenerMetadata(
              instance[key]
            );

            queue.on(metadata.eventName, (job: Job, ...args) => {
              if (
                metadata.processName &&
                metadata.processName !== job.processName
              )
                return;

              instance[key](job, ...args);
            });
          }
        }
      );
    });

    if (!storage) return;

    const uncompletedJobs = await storage.getUncompletedJobs();

    for (const jobEntity of uncompletedJobs) {
      const queueName = jobEntity.processorName;
      const queueToken = getQueueToken(queueName);
      const queue = queues.get(queueToken);

      if (!queue) {
        this.logger.error(`Not found ${queueName} queue`, QueueExplorer.name);
        continue;
      }

      const job = new Job(
        fromJSON(jobEntity.data),
        jobEntity.processorName,
        jobEntity.processName,
        jobEntity.uuid
      );

      queue.addUncompletedJob(job);
    }
  }

  private getQueue(queueToken: string, queueName: string): Queue {
    try {
      return this.moduleRef.get<Queue>(queueToken, { strict: false });
    } catch (err) {
      this.logger.error(`Not found ${queueName} queue`, QueueExplorer.name);
      throw err;
    }
  }
}
