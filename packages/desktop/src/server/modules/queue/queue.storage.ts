import { JobEntity, JobStatusEnum } from "@/server/db/entities/job.entity";
import { Utils } from "@/server/utils";
import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import {
  QUEUE_MODULE_DEFAULT_PROCESS,
  QUEUE_MODULE_DEFAULT_PROCESSOR,
} from "./queue.constants";
import { QueueJobsStorage } from "./queue.decorators";
import { IQueueJobsStorage, Job } from "./queue.job";

@QueueJobsStorage()
export class JobsStorage implements IQueueJobsStorage {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(JobEntity)
    private readonly jobsRepository: Repository<JobEntity>
  ) {}

  saveJob(job: Job, status: JobStatusEnum) {
    return this.jobsRepository.save({
      uuid: job.uuid,
      data: Utils.format.toJSON(job.data, { compress: true }),
      processorName: job.processorName,
      processName: job.processName,
      status,
    });
  }

  getJobByUuid(uuid: string) {
    return this.jobsRepository.findOneBy({
      uuid,
    });
  }

  getProcessingJobs(
    options: { processorName?: string; processName?: string } = {}
  ): Promise<JobEntity[]> {
    return this.jobsRepository.findBy({
      ...options,
      status: JobStatusEnum.PROCESSING,
    });
  }

  getUncompletedJobs(): Promise<JobEntity[]> {
    return this.jobsRepository.findBy({
      status: Not(JobStatusEnum.COMPLETED),
    });
  }

  getLastJobBy(
    job: Partial<Job> & { status?: JobStatusEnum }
  ): Promise<JobEntity | null> {
    return this.jobsRepository.findOne({
      where: {
        uuid: job.uuid,
        data: job.data && Utils.format.toJSON(job.data, { compress: true }),
        processorName: job.processorName ?? QUEUE_MODULE_DEFAULT_PROCESSOR,
        processName: job.processName ?? QUEUE_MODULE_DEFAULT_PROCESS,
        status: job.status,
      },
      order: {
        updatedAt: "DESC",
      },
    });
  }
}
