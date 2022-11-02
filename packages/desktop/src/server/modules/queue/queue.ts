import { JobStatusEnum } from "@/server/db/entities/job.entity";
import { EventListener } from "@/server/utils/event-listener";
import ExternalQueue from "queue";
import {
  QUEUE_MODULE_DEFAULT_PROCESS,
  QUEUE_MODULE_DEFAULT_PROCESSOR,
} from "./queue.constants";
import { QueueEventsEnum } from "./queue.enums";
import { IQueueJobsStorage, Job } from "./queue.job";
import { QueueModuleOptions } from "./queue.options";
import { isString } from "./utils/is-string";

export type ProcessorHandler = (job: Job) => void;
export type ProcessorInstance = () => void;

export class Queue extends EventListener {
  private readonly queue: ExternalQueue;
  private readonly processors: Map<string, ProcessorHandler[]>;
  private readonly jobs: Map<ProcessorInstance, Job>;
  private storage: IQueueJobsStorage;

  constructor(private readonly options: QueueModuleOptions) {
    super();

    this.queue = ExternalQueue({
      results: [],
      autostart: true,
      concurrency: this.options.concurrency,
    });

    this.processors = new Map<string, ProcessorHandler[]>();
    this.jobs = new Map<ProcessorInstance, Job>();

    this.queue.on("start", processorInstance => {
      const job = this.jobs.get(processorInstance);

      if (!job) return;

      this.emit(QueueEventsEnum.ACTIVE, job);
    });

    this.queue.on("success", async (result, processorInstance) => {
      const job = this.jobs.get(processorInstance);

      if (!job) return;

      this.jobs.delete(processorInstance);

      this.emit(QueueEventsEnum.COMPLETED, job, result);
    });

    this.queue.on("error", async (err, processorInstance) => {
      const job = this.jobs.get(processorInstance);

      if (!job) return;

      this.jobs.delete(processorInstance);

      this.emit(QueueEventsEnum.FAILED, job, err);
    });
  }

  addJob<TJobData extends Record<string, any>>(
    processName: string,
    jobData: TJobData
  ): Promise<void>;

  addJob<TJobData extends Record<string, any>>(
    jobData: TJobData
  ): Promise<void>;

  async addJob<TJobData extends Record<string, any>>(
    nameOrJobData: string | TJobData,
    jobData?: TJobData
  ): Promise<void> {
    const processName = isString(nameOrJobData)
      ? (nameOrJobData as string)
      : QUEUE_MODULE_DEFAULT_PROCESS;

    const data = isString(nameOrJobData)
      ? jobData ?? {}
      : (nameOrJobData as TJobData);

    const job = new Job(
      data,
      this.options.name ?? QUEUE_MODULE_DEFAULT_PROCESSOR,
      processName
    );

    this.process(job);
  }

  async addUncompletedJob<TJobData extends Record<string, any>>(
    job: Job<TJobData>
  ): Promise<void> {
    this.process(job);
  }

  async isCompletedJob(job: Partial<Job>) {
    return !!(await this.storage.getLastJobBy({
      ...job,
      status: JobStatusEnum.COMPLETED,
    }));
  }

  private async process<TJobData extends Record<string, any>>(
    job: Job<TJobData>
  ) {
    const processors = this.processors.get(job.processName) ?? [];

    const onProgress = (progress: number) =>
      this.emit(QueueEventsEnum.PROGRESS, job, progress);

    job.on("progress", onProgress);

    processors.forEach(p => {
      const processorInstance = async () => {
        try {
          await this.storage.saveJob(job, JobStatusEnum.PROCESSING);
          await p(job);
          await this.storage.saveJob(job, JobStatusEnum.COMPLETED);
        } catch (e) {
          await this.storage.saveJob(job, JobStatusEnum.FAILED);
          throw e;
        } finally {
          job.off("progress", onProgress);
        }
      };

      this.jobs.set(processorInstance, job);

      this.queue.push(processorInstance);
    });
  }

  addProcessor(name: string, handler: ProcessorHandler) {
    const processors = this.processors.get(name);

    if (Array.isArray(processors)) {
      processors.push(handler);
    } else {
      this.processors.set(name, [handler]);
    }
  }

  setStorage(storage: IQueueJobsStorage) {
    this.storage = storage;
  }
}
