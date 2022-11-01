import Queue from "queue";
import { Injectable, Logger, OnModuleInit, Scope } from "@nestjs/common";
import { EventListener } from "@server/utils/event-listener";
import { Not, Repository } from "typeorm";
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

export function createWorker<
  TContext extends IWorkerContext = object,
  TResult extends IWorkerResult = void
>(handler: (ctx: TContext) => Promise<TResult>): IWorker<TContext, TResult> {
  return {
    run: handler,
  };
}

type WorkerInstance = () => any;

@Injectable({
  scope: Scope.TRANSIENT,
})
export class QueueManager extends EventListener implements OnModuleInit {
  private readonly queue: Queue;
  private readonly workers: Map<string, IWorker> = new Map<string, IWorker>();
  private readonly jobs: Map<WorkerInstance, JobEntity> = new Map<
    WorkerInstance,
    JobEntity
  >();

  constructor(
    @InjectRepository(JobEntity)
    private readonly jobsRepository: Repository<JobEntity>,
    private readonly logger: Logger
  ) {
    super();

    this.queue = Queue({ results: [], autostart: true, concurrency: 1 });

    this.queue.on("start", workerInstance => {
      const job = this.jobs.get(workerInstance) as JobEntity;

      this.logger.log(
        `The Job Execution:\n - job: ${toJSON(job)}`,
        QueueManager.name
      );

      this.emit("start", job);
    });

    this.queue.on("success", async (result, workerInstance) => {
      const job = this.jobs.get(workerInstance) as JobEntity;

      this.logger.log(
        `The Job is done:\n - job: ${toJSON(job)}\n - result: ${toJSON(
          result
        )}`,
        QueueManager.name
      );

      this.jobs.delete(workerInstance);

      job.status = JobStatusEnum.FINISHED;

      await this.jobsRepository.save(job);

      this.emit("done", result, job);
    });

    this.queue.on("error", async (err, workerInstance) => {
      const job = this.jobs.get(workerInstance) as JobEntity;

      this.logger.error(
        `The Job is failed:\n - job: ${toJSON(job)}\n - error: ${toJSON(err)}`,
        QueueManager.name
      );

      this.jobs.delete(workerInstance);

      job.status = JobStatusEnum.ERROR;

      await this.jobsRepository.save(job);

      this.emit("failed", err, job);
    });
  }

  async onModuleInit() {
    const unfinishedJobs = await this.jobsRepository.find({
      where: {
        status: JobStatusEnum.PROCESSING,
      },
    });

    for (const finishedJob of unfinishedJobs) {
      this.addUnfinishedJob(finishedJob);
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

    this.jobs.set(workerInstance, await this.jobsRepository.save(job));

    this.queue.push(workerInstance);
  }

  public async isJobFinished<TContext extends IWorkerContext>(
    type: string,
    ctx: TContext
  ) {
    const jobs = await this.jobsRepository.find({
      where: {
        ctx: JSON.stringify(ctx),
        type,
        status: JobStatusEnum.FINISHED,
      },
    });

    return jobs.length !== 0;
  }

  private async addUnfinishedJob(job: JobEntity): Promise<void> {
    const worker = this.workers.get(job.type);

    if (!worker) return;

    const workerInstance = () => worker.run(fromJSON(job.ctx));

    this.jobs.set(workerInstance, job);

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
