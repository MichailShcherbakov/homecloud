import { Inject, SetMetadata } from "@nestjs/common";
import {
  QUEUE_MODULE_DEFAULT_PROCESS,
  QUEUE_MODULE_DEFAULT_PROCESSOR,
  QUEUE_MODULE_JOBS_STORAGE,
  QUEUE_MODULE_LISTENER,
  QUEUE_MODULE_PROCESS,
  QUEUE_MODULE_PROCESSOR,
} from "./queue.constants";
import { QueueEventsEnum } from "./queue.enums";
import { getQueueToken } from "./utils/get-queue-token";

export interface ProcessorOptions {
  name: string;
}

export interface ProcessOptions {
  name: string;
}

export interface ListenerOptions {
  processName?: string;
  eventName: QueueEventsEnum;
}

export const Processor = (name = QUEUE_MODULE_DEFAULT_PROCESSOR) =>
  SetMetadata(QUEUE_MODULE_PROCESSOR, { name });

export const Process = (name = QUEUE_MODULE_DEFAULT_PROCESS) =>
  SetMetadata(QUEUE_MODULE_PROCESS, { name });

export const InjectQueue = (name?: string) => Inject(getQueueToken(name));

export const QueueJobsStorage = () =>
  SetMetadata(QUEUE_MODULE_JOBS_STORAGE, { isStorage: true });

export const OnJobActive = (processName?: string) =>
  SetMetadata(QUEUE_MODULE_LISTENER, {
    processName,
    eventName: QueueEventsEnum.ACTIVE,
  });

export const OnJobProgress = (processName?: string) =>
  SetMetadata(QUEUE_MODULE_LISTENER, {
    processName,
    eventName: QueueEventsEnum.PROGRESS,
  });

export const OnJobCompleted = (processName?: string) =>
  SetMetadata(QUEUE_MODULE_LISTENER, {
    processName,
    eventName: QueueEventsEnum.COMPLETED,
  });

export const OnJobFailed = (processName?: string) =>
  SetMetadata(QUEUE_MODULE_LISTENER, {
    processName,
    eventName: QueueEventsEnum.FAILED,
  });
