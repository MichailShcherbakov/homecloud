import { Logger, Module } from "@nestjs/common";
import { FileSystemService } from "./file-system.service";
import { WatcherModule } from "./watcher";

@Module({
  imports: [WatcherModule],
  providers: [Logger, FileSystemService],
  exports: [FileSystemService],
})
export class FileSystemModule {}
