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
import { StorageGatewayEventsEnum } from "../storage/storage.events";
import { StorageGateway } from "../storage/storage.gateway";

export interface ConverterWorkerJobData {
  file: FileEntity;
  inputFilePath: string;
  outputFilePath: string;
}

@Processor("converter")
export class ConverterWorker {
  constructor(
    private readonly logger: Logger,
    private readonly gateway: StorageGateway
  ) {}

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

    this.gateway.sendMessage(
      StorageGatewayEventsEnum.ON_NEW_ENTITY_UPLOAD_PROGRESS,
      {
        file: job.data.file,
        progress,
      }
    );
  }

  @OnJobCompleted()
  onJobCompleted(job: Job<ConverterWorkerJobData>) {
    this.logger.log(
      `[${job.uuid}]The conversion is done.`,
      ConverterWorker.name
    );

    this.gateway.sendMessage(StorageGatewayEventsEnum.ON_NEW_ENTITY_UPLOADED, {
      file: job.data.file,
    });
  }

  @OnJobFailed()
  onJobFailed(job: Job<ConverterWorkerJobData>) {
    this.logger.error(
      `[${job.uuid}] The conversion is failed.`,
      ConverterWorker.name
    );
  }
}
