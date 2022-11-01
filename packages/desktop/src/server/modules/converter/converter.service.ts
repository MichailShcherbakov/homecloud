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

export interface ConverterFile {
  inputFilePath: string;
  outputFilePath: string;
}

@Injectable()
export class Converter extends EventListener implements OnModuleInit {
  private readonly watcher: chokidar.FSWatcher;

  constructor(
    private readonly config: ConfigService,
    private readonly queue: QueueManager,
    private readonly logger: Logger
  ) {
    super();

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

    this.watcher = chokidar.watch(this.config.getRootPath(), {
      ignored: /(.+)\.media\/(.+)/,
    });
  }

  onModuleInit() {
    this.watcher.on("add", async globalPath => {
      this.logger.log(`The entity was detected: ${globalPath}`, Converter.name);

      const globalRootPath = this.config.getRootPath();
      const localPath = globalPath
        .replaceAll("\\", "/")
        .replace(globalRootPath, "");

      const rawPath = localPath.split("/");

      const filename = rawPath[rawPath.length - 1].replace(/\.[^/.]+$/, "");

      rawPath.pop();

      const localDirPath = rawPath.join("/");

      const isFileExists = await access(
        join(
          globalRootPath,
          ".media",
          localDirPath,
          filename,
          `${filename}.m3u8`
        )
      );

      if (isFileExists) return;

      const inputFilePath = globalPath;
      const outputDir = join(
        globalRootPath,
        `.media${localDirPath}/${filename}`
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

    this.watcher.on("unlink", async globalPath => {
      this.logger.log(`Deleting the entity was detected`, Converter.name);

      const globalRootPath = this.config.getRootPath();
      const localPath = globalPath
        .replaceAll("\\", "/")
        .replace(globalRootPath, "");

      const rawPath = localPath.split("/");

      const filename = rawPath[rawPath.length - 1].replace(/\.[^/.]+$/, "");

      rawPath.pop();

      const localDirPath = rawPath.join("/");

      const isFileExists = await access(
        join(
          globalRootPath,
          ".media",
          localDirPath,
          filename,
          `${filename}.m3u8`
        )
      );

      if (!isFileExists) return;

      await rm(join(globalRootPath, ".media", localDirPath, filename), {
        recursive: true,
        force: true,
      });

      this.logger.log(`The entity was deleted`, Converter.name);
    });
  }

  public addFile(file: ConverterFile) {
    this.queue.add(async () => {
      await toHLS(file.inputFilePath, file.outputFilePath);

      this.logger.log(`Conversion completed successfully`, Converter.name);

      return { file, shouldToBeConvertedAmount: this.queue.getCount() };
    });
  }

  public async run() {
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
  }
}
