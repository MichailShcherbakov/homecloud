import { JobEntity, JobStatusEnum } from "@/server/db/entities/job.entity";
import { EventListener } from "@/server/utils/event-listener";
import { v4 as uuidv4 } from "uuid";
import {
  QUEUE_MODULE_DEFAULT_PROCESS,
  QUEUE_MODULE_DEFAULT_PROCESSOR,
} from "./queue.constants";

export class Job<
  TData extends Record<string, any> = Record<string, any>
> extends EventListener {
  constructor(
    public readonly data: TData,
    public readonly processorName: string = QUEUE_MODULE_DEFAULT_PROCESSOR,
    public readonly processName: string = QUEUE_MODULE_DEFAULT_PROCESS,
    public readonly uuid: string = uuidv4()
  ) {
    super();
  }

  progress(step: number) {
    this.emit("progress", step);
  }
}

export interface IQueueJobsStorage {
  saveJob(job: Job, status: JobStatusEnum): Promise<JobEntity>;
  getJobByUuid(uuid: string): Promise<JobEntity | null>;
  getUncompletedJobs(): Promise<JobEntity[]>;
  getLastJobBy(
    job: Partial<Job> & { status?: JobStatusEnum }
  ): Promise<JobEntity | null>;
}
