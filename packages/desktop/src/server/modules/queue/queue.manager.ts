import Queue from "queue";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { EventListener } from "@server/utils/event-listener";
import { Repository } from "typeorm";
import { JobEntity, JobStatusEnum } from "@/server/db/entities/job.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { fromJSON, toJSON } from "@/server/utils/json";

export type IWorkerContext = Record<string, any>;

export type IWorkerResult = any;

export interface IWorker<
  TContext extends IWorkerContext = object,
  TResult extends IWorkerResult = void
> {
  run(ctx: TContext): Promise<TResult>;
}

type WorkerInstance = () => any;

@Injectable()
export class QueueManager extends EventListener implements OnModuleInit {
  private readonly queue: Queue;
  private readonly workers: Map<string, IWorker> = new Map<string, IWorker>();
  private readonly workerInstances: Map<WorkerInstance, JobEntity> = new Map<
    WorkerInstance,
    JobEntity
  >();

  constructor(
    @InjectRepository(JobEntity)
    private readonly jobsRepository: Repository<JobEntity>,
    private readonly logger: Logger
  ) {
    super();

    this.queue = Queue({ results: [], autostart: true, concurrency: 5 });

    this.queue.on("start", job => {
      const workerInstance = this.workerInstances.get(job);

      this.logger.log(
        `The Job Execution:\n - job: ${JSON.stringify(
          workerInstance,
          null,
          4
        )}`,
        QueueManager.name
      );

      this.emit("start", workerInstance);
    });

    this.queue.on("success", async (result, workerInstance) => {
      const job = this.workerInstances.get(workerInstance) as JobEntity;

      this.logger.log(
        `The Job is done:\n - job: ${toJSON(job)}\n - result: ${toJSON(
          result
        )}`,
        QueueManager.name
      );

      this.workerInstances.delete(workerInstance);

      job.status = JobStatusEnum.FINISHED;

      await this.jobsRepository.save(job);

      this.emit("done", result, workerInstance);
    });

    this.queue.on("error", async (err, workerInstance) => {
      const job = this.workerInstances.get(workerInstance) as JobEntity;

      this.logger.error(
        `The Job is failed:\n - job: ${toJSON(job)}\n - error: ${toJSON(err)}`,
        QueueManager.name
      );

      this.workerInstances.delete(workerInstance);

      job.status = JobStatusEnum.ERROR;

      await this.jobsRepository.save(job);

      this.emit("failed", err, workerInstance);
    });

    /* this.queue.on("end", (_, err) => {
      this.emit("end", err);
    }); */
  }

  async onModuleInit() {
    const unfinishedJobs = await this.jobsRepository.find({
      where: {
        status: JobStatusEnum.PROCESSING,
      },
    });

    for (const finishedJob of unfinishedJobs) {
      this.addExistsJob(finishedJob);
    }
  }

  public addWorker<
    TWorker extends IWorker<TContext, TResult>,
    TContext extends IWorkerContext,
    TResult extends IWorkerResult
  >(type: string, workerBuilder: () => TWorker): void {
    this.workers.set(type, workerBuilder() as IWorker);
  }

  public async addJob<TContext extends IWorkerContext>(
    type: string,
    ctx: TContext
  ): Promise<void> {
    const job = new JobEntity();
    job.ctx = JSON.stringify(ctx);
    job.type = type;
    job.status = JobStatusEnum.PROCESSING;

    const worker = this.workers.get(type);

    if (!worker) return;

    const workerInstance = () => worker.run(ctx);

    this.workerInstances.set(
      workerInstance,
      await this.jobsRepository.save(job)
    );

    this.queue.push(workerInstance);
  }

  private async addExistsJob(job: JobEntity): Promise<void> {
    const worker = this.workers.get(job.type);

    if (!worker) return;

    const workerInstance = () => worker.run(fromJSON(job.ctx));

    this.workerInstances.set(workerInstance, job);

    this.queue.push(workerInstance);
  }

  public getCount() {
    return this.queue.length;
  }

  public setAutostart(flag: boolean) {
    this.queue.autostart = flag;
  }

  public run(cb?: () => void) {
    this.queue.start(cb);
  }
}
