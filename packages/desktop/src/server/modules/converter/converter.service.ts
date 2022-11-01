import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { join } from "path";
import hidefile from "hidefile";
import { mkdir, rm } from "fs/promises";
import { ConfigService } from "../config/config.service";
import { QueueManager } from "../queue/queue.manager";
import { access } from "@server/utils/access";
import { ConverterWorker, ConverterWorkerContext } from "./converter.worker";
import { getInfoFromPath } from "@/server/utils/getInfoFromPath";
import { OnEvent } from "@nestjs/event-emitter";
import { FileEntity } from "@/server/db/entities/file.entity";
import { StorageManager } from "../storage/storage.manager";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { JobEntity } from "@/server/db/entities/job.entity";

const CONVERTER_WORKER_TYPE = "CONVERTER_WORKER_TYPE";

export interface ConverterFile {
  inputFilePath: string;
  outputFilePath: string;
}

@Injectable()
export class Converter implements OnModuleInit {
  constructor(
    private readonly config: ConfigService,
    private readonly queue: QueueManager,
    private readonly logger: Logger,
    private readonly storageManager: StorageManager,
    private readonly emitter: EventEmitter2
  ) {
    this.queue.addWorker(CONVERTER_WORKER_TYPE, () => new ConverterWorker());

    this.queue.on("start", (job: JobEntity) => {
      this.logger.log("Start of conversion...", Converter.name);

      this.emitter.emit("converter.start", job);
    });

    this.queue.on("done", (result, job: JobEntity) => {
      this.logger.log("The conversion is done.", Converter.name);

      this.emitter.emit("converter.done", job);
    });

    this.queue.on("failed", (err, job) => {
      this.logger.error("The conversion is failed.", Converter.name);

      this.emitter.emit("converter.failed", job);
    });
  }

  async onModuleInit() {
    const absoluteRootPath = await this.config.getRootPath();
    const mediaDirPath = `${absoluteRootPath}/.media`;
    const isMediaDirExists = await access(mediaDirPath);

    if (!isMediaDirExists) {
      await mkdir(mediaDirPath, { recursive: true });

      hidefile.hideSync(mediaDirPath);
    }

    const files = await this.storageManager.findFiles();

    for (const file of files) {
      this.onAddFile(file);
    }
  }

  public addFile(file: ConverterFile) {
    this.queue.addJob<ConverterWorkerContext>(CONVERTER_WORKER_TYPE, {
      inputFilePath: file.inputFilePath,
      outputFilePath: file.outputFilePath,
    });
  }

  @OnEvent("storage.add_file")
  private async onAddFile(file: FileEntity) {
    const absoluteRootPath = await this.config.getRootPath();

    const { filename, relativeDirPath } = getInfoFromPath(
      absoluteRootPath,
      file.absolutePath
    );

    const inputFilePath = file.absolutePath;
    const outputDir = join(
      absoluteRootPath,
      `.media${relativeDirPath}/${filename}`
    );
    const outputFilePath = join(outputDir, `${filename}.m3u8`);

    const isJobFinished = await this.queue.isJobFinished(
      CONVERTER_WORKER_TYPE,
      {
        inputFilePath,
        outputFilePath,
      }
    );

    const isFileExists = await access(
      join(
        absoluteRootPath,
        ".media",
        relativeDirPath,
        filename,
        `${filename}.m3u8`
      )
    );

    if (isFileExists && isJobFinished) return;

    this.logger.log(
      `Preparing to convert the file...: ${file.absolutePath}`,
      Converter.name
    );

    await mkdir(outputDir, { recursive: true });

    this.addFile({
      inputFilePath,
      outputFilePath,
    });

    this.logger.log(
      `The converting job was added to the queue:\n - from: ${inputFilePath}\n - to: ${outputFilePath}`,
      Converter.name
    );
  }

  @OnEvent("storage.remove_file")
  private async onRemoveFile(file: FileEntity) {
    const absoluteRootPath = await this.config.getRootPath();

    const { filename, relativeDirPath } = getInfoFromPath(
      absoluteRootPath,
      file.absolutePath
    );

    const isFileExists = await access(
      join(
        absoluteRootPath,
        ".media",
        relativeDirPath,
        filename,
        `${filename}.m3u8`
      )
    );

    if (!isFileExists) return;

    this.logger.log(
      `Preparing to delete the media file...: ${file.absolutePath}`,
      Converter.name
    );

    await rm(join(absoluteRootPath, ".media", relativeDirPath, filename), {
      recursive: true,
      force: true,
    });

    this.logger.log(
      `The media file was deleted: ${file.absolutePath}`,
      Converter.name
    );
  }
}
