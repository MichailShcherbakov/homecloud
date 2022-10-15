import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import chokidar from "chokidar";
import { Entity } from "./type";
import { deepReadDir } from "./utils/deep-read-dir";
import { LocalStorage } from "./local-storage";
import { ConfigService } from "../config/config.service";

@Injectable()
export class FileSystemService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly configService: ConfigService,
    private readonly localStorage: LocalStorage
  ) {}

  async onModuleInit() {}

  onModuleDestroy() {}
}
