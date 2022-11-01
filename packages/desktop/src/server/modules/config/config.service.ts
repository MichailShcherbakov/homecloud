import { Injectable, Logger } from "@nestjs/common";
import { resolve } from "path";
import { join } from "path";
import { writeFile } from "fs/promises";
import { readOrCreateFileSync } from "@server/utils/readOrCreateFile";

const CONFIG_FILE_NAME = "homecloud.config.json";
const DEFAULT_CONFIG_DIR_NAME = "storage";

export interface Config {
  path: {
    root: string;
  };
}

@Injectable({})
export class ConfigService {
  private path: string = resolve(process.cwd(), CONFIG_FILE_NAME);
  private config: Config;

  constructor(private readonly logger: Logger) {
    const initialConfig = JSON.stringify({
      path: { root: join(process.cwd(), DEFAULT_CONFIG_DIR_NAME) },
    });

    this.config = JSON.parse(
      readOrCreateFileSync(this.path, initialConfig)
    ) as Config;

    this.logger.log(
      `Found config file: ${CONFIG_FILE_NAME}`,
      ConfigService.name
    );
    this.logger.log(JSON.stringify(this.config, "", 4), ConfigService.name);
  }

  getRootPath(): string {
    return this.config.path.root;
  }

  async setRootPath(val: string): Promise<void> {
    this.config.path.root = val;

    await this.sync();
  }

  private async sync(): Promise<void> {
    writeFile(this.path, JSON.stringify(this.config));

    this.logger.log(
      `Sync config file: ${CONFIG_FILE_NAME}`,
      ConfigService.name
    );
  }
}
