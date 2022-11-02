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
  eventName: QueueEventsEnum;
}

export const Processor = (name = QUEUE_MODULE_DEFAULT_PROCESSOR) =>
  SetMetadata(QUEUE_MODULE_PROCESSOR, { name });

export const Process = (name = QUEUE_MODULE_DEFAULT_PROCESS) =>
  SetMetadata(QUEUE_MODULE_PROCESS, { name });

export const InjectQueue = (name?: string) => Inject(getQueueToken(name));

export const QueueJobsStorage = () =>
  SetMetadata(QUEUE_MODULE_JOBS_STORAGE, { isStorage: true });

export const OnQueueActive = () =>
  SetMetadata(QUEUE_MODULE_LISTENER, { eventName: QueueEventsEnum.ACTIVE });

export const OnQueueProgress = () =>
  SetMetadata(QUEUE_MODULE_LISTENER, { eventName: QueueEventsEnum.PROGRESS });

export const OnQueueCompleted = () =>
  SetMetadata(QUEUE_MODULE_LISTENER, { eventName: QueueEventsEnum.COMPLETED });

export const OnQueueFailed = () =>
  SetMetadata(QUEUE_MODULE_LISTENER, { eventName: QueueEventsEnum.FAILED });
