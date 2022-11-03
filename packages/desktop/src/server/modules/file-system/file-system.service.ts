import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import chokidar from "chokidar";
import { ConfigService } from "../config/config.service";

@Injectable()
export class FileSystemService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {}

  onModuleDestroy() {}
}
