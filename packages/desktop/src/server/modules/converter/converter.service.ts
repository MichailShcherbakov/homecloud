import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { toHLS } from "@server/utils/to-hls";
import { EventListener } from "@server/utils/event-listener";
import { readDir } from "@server/utils/read-dir";
import { join } from "path";
import hidefile from "hidefile";
import { mkdir, rm } from "fs/promises";
import { ConfigService } from "../config/config.service";
import { QueueManager } from "../queue/queue.manager";
import chokidar from "chokidar";
import { access } from "@server/utils/access";
import { ConverterWorker, ConverterWorkerContext } from "./comverter.worker";
import { getInfoFromPath } from "@/server/utils/getInfoFromPath";

const CONVERTER_WORKER_TYPE = "CONVERTER_WORKER_TYPE";

export interface ConverterFile {
  inputFilePath: string;
  outputFilePath: string;
}

@Injectable()
export class Converter extends EventListener implements OnModuleInit {
  private watcher: chokidar.FSWatcher;

  constructor(
    private readonly config: ConfigService,
    private readonly queue: QueueManager,
    private readonly logger: Logger
  ) {
    super();

    this.queue.addWorker(CONVERTER_WORKER_TYPE, () => new ConverterWorker());

    this.queue.on("start", () => {
      this.logger.log("Start of conversion...", Converter.name);

      this.emit("start", { shouldToBeConvertedAmount: this.queue.getCount() });
    });

    this.queue.on("done", file => {
      this.logger.log("The conversion is done.", Converter.name);

      this.emit("done", file);
    });

    this.queue.on("failed", () => {
      this.logger.error("The conversion is failed.", Converter.name);

      this.emit("failed");
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

    this.watcher = chokidar.watch(absoluteRootPath, {
      ignored: /(.+)\.media\/(.+)/,
    });

    this.watcher.on("add", async absolutePath => {
      this.logger.log(
        `The entity was detected: ${absolutePath}`,
        Converter.name
      );

      const { filename, relativeDirPath } = getInfoFromPath(
        absoluteRootPath,
        absolutePath
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

      if (isFileExists) return;

      const inputFilePath = absolutePath;
      const outputDir = join(
        absoluteRootPath,
        `.media${relativeDirPath}/${filename}`
      );
      const outputFilePath = join(outputDir, `${filename}.m3u8`);

      await mkdir(outputDir, { recursive: true });

      this.addFile({
        inputFilePath,
        outputFilePath,
      });

      this.logger.log(
        `The entity was added to queue: - from: \n${inputFilePath} - to: \n${outputFilePath}`,
        Converter.name
      );
    });

    this.watcher.on("unlink", async absolutePath => {
      this.logger.log(`Deleting the entity was detected`, Converter.name);

      const { filename, relativeDirPath } = getInfoFromPath(
        absoluteRootPath,
        absolutePath
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

      await rm(join(absoluteRootPath, ".media", relativeDirPath, filename), {
        recursive: true,
        force: true,
      });

      this.logger.log(`The entity was deleted`, Converter.name);
    });
  }

  public addFile(file: ConverterFile) {
    this.queue.addJob<ConverterWorkerContext>(CONVERTER_WORKER_TYPE, {
      inputFilePath: file.inputFilePath,
      outputFilePath: file.outputFilePath,
    });
  }

  /* public async run() {
    this.queue.setAutostart(false);

    const globalRootPath = this.config.getRootPath();

    const entities = await readDir(globalRootPath, {
      includeExts: [".mp4", ".mkv", ".webm", ".avi"],
      excludeDirPaths: ["/.media/"],
      onlyFiles: true,
    });

    const converted = await readDir(globalRootPath, {
      includeExts: [".m3u8"],
      includeDirPaths: ["/.media/"],
      onlyFiles: true,
    });

    const shouldToBeRemoved = converted.filter(
      c =>
        !entities.find(e => `${c.parentDirPath}${e.ext}` === `/.media${e.path}`)
    );

    await Promise.all(
      shouldToBeRemoved.map(e =>
        rm(join(globalRootPath, e.parentDirPath), {
          recursive: true,
          force: true,
        })
      )
    );

    const shouldToBeConverted = entities.filter(
      e =>
        !converted.find(
          c => `${c.parentDirPath}${e.ext}` === `/.media${e.path}`
        )
    );

    await mkdir(`${globalRootPath}/.media`, { recursive: true });

    hidefile.hideSync(`${globalRootPath}/.media`);

    for (let i = 0; i < shouldToBeConverted.length; ++i) {
      const e = shouldToBeConverted[i];

      const inputFilePath = join(globalRootPath, e.path);
      const outputDir = join(
        globalRootPath,
        `.media${e.path.replace(/\.[^/.]+$/, "")}`
      );
      const outputFilePath = join(outputDir, `${e.name}.m3u8`);

      await mkdir(outputDir, { recursive: true });

      this.addFile({
        inputFilePath,
        outputFilePath,
      });
    }

    this.queue.run(() => {
      this.emit("end");

      this.queue.setAutostart(true);
    });
  } */
}
