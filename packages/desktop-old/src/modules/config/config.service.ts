import { Injectable } from "@nestjs/common";
import ini from "ini";
import { resolve } from "path";
import { readFileSync } from "fs";
import { writeFile } from "fs/promises";

export interface Config {
  path: {
    root: string;
  };
}

@Injectable({})
export class ConfigService {
  private path: string = resolve(process.cwd(), "config.ini");
  private config: Config;

  constructor() {
    this.config = ini.parse(readFileSync(this.path, "utf-8")) as Config;
  }

  get(section: "path", key: "root"): string {
    return this.config[section][key];
  }

  async set(section: "path", key: "root", val: string): Promise<void> {
    this.config[section][key] = val;

    await this.sync();
  }

  private sync(): Promise<void> {
    return writeFile(this.path, ini.stringify(this.config));
  }
}
