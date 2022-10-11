import { Module } from "@nestjs/common";
import { FileSystemModule } from "../file-system/file-system.module";
import { StorageController } from "./storage.controller";
import { StorageService } from "./storage.service";

@Module({
  imports: [FileSystemModule],
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
