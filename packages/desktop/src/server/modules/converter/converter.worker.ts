import { Logger } from "@nestjs/common";
import { toHLS } from "@server/utils/to-hls";
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  OnQueueProgress,
  Process,
  Processor,
} from "../queue/queue.decorators";
import { Job } from "../queue/queue.job";

export interface ConverterWorkerJobData {
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

  @OnQueueActive()
  onQueueActive(job: Job<ConverterWorkerJobData>) {
    this.logger.log(`[${job.uuid}] Start of conversion`, ConverterWorker.name);
  }

  @OnQueueProgress()
  onQueueProgress(job: Job<ConverterWorkerJobData>, progress: number) {
    this.logger.log(
      `[${job.uuid}] Processing..: ${progress}%`,
      ConverterWorker.name
    );
  }

  @OnQueueCompleted()
  onQueueCompleted(job: Job<ConverterWorkerJobData>) {
    this.logger.log(
      `[${job.uuid}]The conversion is done.`,
      ConverterWorker.name
    );
  }

  @OnQueueFailed()
  onQueueFailed(job: Job<ConverterWorkerJobData>) {
    this.logger.log(
      `[${job.uuid}] The conversion is failed.`,
      ConverterWorker.name
    );
  }
}
