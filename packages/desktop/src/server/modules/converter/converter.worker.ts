import { FileEntity } from "@/server/db/entities/file.entity";
import { Logger } from "@nestjs/common";
import { toHLS } from "@server/utils/to-hls";
import {
  OnJobActive,
  OnJobCompleted,
  OnJobFailed,
  OnJobProgress,
  Process,
  Processor,
} from "../queue/queue.decorators";
import { Job } from "../queue/queue.job";
import { StorageGateway } from "../gateway/gateway.service";

export interface ConverterWorkerJobData {
  file: FileEntity;
  inputFilePath: string;
  outputFilePath: string;
}

@Processor("converter")
export class ConverterWorker {
  constructor(private readonly logger: Logger) {}

  @Process()
  async covert(job: Job<ConverterWorkerJobData>) {
    const { inputFilePath, outputFilePath } = job.data;

    await toHLS(inputFilePath, outputFilePath, progress => {
      job.progress(progress.percent);
    });
  }

  @OnJobActive()
  onJobActive(job: Job<ConverterWorkerJobData>) {
    this.logger.log(`[${job.uuid}] Start of conversion`, ConverterWorker.name);
  }

  @OnJobProgress()
  onJobProgress(job: Job<ConverterWorkerJobData>, progress: number) {
    this.logger.log(
      `[${job.uuid}] Processing..: ${progress}%`,
      ConverterWorker.name
    );
  }

  @OnJobCompleted()
  onJobCompleted(job: Job<ConverterWorkerJobData>) {
    this.logger.log(
      `[${job.uuid}]The conversion is done.`,
      ConverterWorker.name
    );
  }

  @OnJobFailed()
  onJobFailed(job: Job<ConverterWorkerJobData>) {
    this.logger.error(
      `[${job.uuid}] The conversion is failed.`,
      ConverterWorker.name
    );
  }
}
