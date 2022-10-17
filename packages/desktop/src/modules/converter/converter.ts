import { Injectable } from "@nestjs/common";
import { toHLS } from "@/utils/to-hls";
import { EventListener } from "@/utils/event-listener";
import { readDir } from "@/utils/read-dir";
import { join } from "path";
import hidefile from "hidefile";
import { mkdir, rm } from "fs/promises";
import { ConfigService } from "../config/config.service";
import { QueueManager } from "../queue/queue.manager";

export interface ConverterFile {
  inputFilePath: string;
  outputFilePath: string;
}

@Injectable()
export class Converter extends EventListener {
  constructor(
    private readonly config: ConfigService,
    private readonly queue: QueueManager
  ) {
    super();

    this.queue.on("start", () => {
      this.emit("start", { shouldToBeConvertedAmount: this.queue.getCount() });
    });
    this.queue.on("done", file => {
      this.emit("done", file);
    });
    this.queue.on("failed", () => {
      this.emit("failed");
    });
  }

  public addFile(file: ConverterFile) {
    this.queue.add(async () => {
      await toHLS(file.inputFilePath, file.outputFilePath);
      return { file, shouldToBeConvertedAmount: this.queue.getCount() };
    });
  }

  public async run() {
    this.queue.setAutostart(false);

    const globalRootPath = this.config.get("path", "root");

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
