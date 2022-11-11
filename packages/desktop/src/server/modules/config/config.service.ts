import { Injectable, Logger } from "@nestjs/common";
import { readFileSync, writeFileSync } from "fs";
import { resolve, join, sep } from "path";
import { fromJSON, toJSON } from "@/server/utils/format";
import {
  DEFAULT_CONFIG_NAME,
  DEFAULT_CONFIG_DIR_NAME,
  ROOT_RELATIVE_PATH,
} from "./config.constants";
import { accessSync } from "@/server/utils/fs";

export interface Config {
  absoluteRootPath: string;
  absoluteTempPath: string;
}

@Injectable()
export class ConfigService {
  private config: Config;

  constructor(private readonly logger: Logger) {
    const configAbsolutePath = join(process.cwd(), DEFAULT_CONFIG_NAME);

    try {
      const data = readFileSync(configAbsolutePath, "utf8");
      const config = fromJSON<Partial<Config>>(data);

      if (!config.absoluteRootPath || !config.absoluteTempPath)
        throw new Error(`Incorrect config file`);

      this.config = {
        absoluteRootPath: config.absoluteRootPath,
        absoluteTempPath: config.absoluteTempPath,
      };
    } catch (e) {
      this.logger.error(`Failed to read config file.`, ConfigService.name);

      this.logger.log(`Creating initial config file...`, ConfigService.name);

      this.config = {
        absoluteRootPath: resolve(process.cwd(), DEFAULT_CONFIG_DIR_NAME),
        absoluteTempPath: process.env.TEMP_DIST as string,
      };

      writeFileSync(configAbsolutePath, toJSON(this.config));

      this.logger.log(
        `The initial config file was created.`,
        ConfigService.name
      );
    } finally {
      this.logger.log(
        `Loaded the configuration:\n${toJSON(this.config)}`,
        ConfigService.name
      );
    }
  }

  getAbsoluteRootPath(): string {
    return this.config.absoluteRootPath;
  }

  setAbsoluteRootPath(path: string): void {
    this.config.absoluteRootPath = path;

    this.sync();
  }

  private sync(): void {
    const configAbsolutePath = join(process.cwd(), DEFAULT_CONFIG_NAME);

    writeFileSync(configAbsolutePath, toJSON(this.config));

    this.logger.log(
      `Sync configuration:/n${toJSON(this.config)}`,
      ConfigService.name
    );
  }

  getRelativePathBy(absolutePath: string): string {
    const absoluteRootPath = this.getAbsoluteRootPath();

    const relativePath = absolutePath.replace(absoluteRootPath, "");

    if (relativePath === absolutePath)
      throw new Error(
        `The root path and the given absolute path is not comparable: ${absoluteRootPath} ${absolutePath}`
      );

    if (!relativePath.length) return ROOT_RELATIVE_PATH;

    return relativePath;
  }

  getAbsolutePathBy(relativePath: string): string | null {
    const absoluteRootPath = this.getAbsoluteRootPath();

    const absolutePath = join(absoluteRootPath, relativePath);

    const isExists = accessSync(absolutePath);

    if (!isExists) {
      return null;
    }

    return absolutePath;
  }

  getAbsolutePathByOrFail(relativePath: string): string {
    const absolutePath = this.getAbsolutePathBy(relativePath);

    if (!absolutePath) {
      throw new Error(
        `The entity with the path does not exist: ${absolutePath}`
      );
    }

    return absolutePath;
  }

  public getAbsoluteTempPath() {
    return this.config.absoluteTempPath;
  }
}
