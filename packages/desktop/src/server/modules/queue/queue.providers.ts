import { Logger, Provider } from "@nestjs/common";
import { Queue } from "./queue";
import { QUEUE_MODULE_QUEUE_OPTIONS } from "./queue.constants";
import { QueueModuleOptions } from "./queue.options";
import { getQueueToken } from "./utils/get-queue-token";

export function buildQueue(options: QueueModuleOptions) {
  const queue = new Queue(options);
  return queue;
}

export function createQueueProviders(options: QueueModuleOptions): Provider[] {
  return [
    Logger,
    {
      provide: QUEUE_MODULE_QUEUE_OPTIONS,
      useValue: options,
    },
    {
      provide: getQueueToken(options.name),
      useFactory: () => {
        return buildQueue(options);
      },
    },
  ];
}
