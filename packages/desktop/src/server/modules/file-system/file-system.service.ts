import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import chokidar from "chokidar";
import { LocalStorage } from "./local-storage.service";
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
