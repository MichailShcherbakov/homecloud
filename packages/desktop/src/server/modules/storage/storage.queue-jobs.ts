import { JobEntity, JobStatusEnum } from "@/server/db/entities/job.entity";
import { toJSON } from "@/server/utils/json";
import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  IQueueJobsStorage,
  Job,
  QueueJobsStorage,
  QUEUE_MODULE_DEFAULT_PROCESS,
  QUEUE_MODULE_DEFAULT_PROCESSOR,
} from "../queue";

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
      data: toJSON(job.data, { compress: true }),
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

  getUncompletedJobs(): Promise<JobEntity[]> {
    return this.jobsRepository.findBy({
      status: JobStatusEnum.PROCESSING,
    });
  }

  getLastJobBy(
    job: Partial<Job> & { status?: JobStatusEnum }
  ): Promise<JobEntity | null> {
    return this.jobsRepository.findOne({
      where: {
        uuid: job.uuid,
        data: job.data && toJSON(job.data, { compress: true }),
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
