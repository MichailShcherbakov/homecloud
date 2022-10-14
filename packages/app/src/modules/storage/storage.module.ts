import { Module } from "@nestjs/common";
import { ConfigModule } from "../config/config.module";
import { FileSystemModule } from "../file-system/file-system.module";
import { StorageController } from "./storage.controller";
import { StorageService } from "./storage.service";

@Module({
  imports: [ConfigModule, FileSystemModule],
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
