import { Module } from "@nestjs/common";
import { ConfigModule } from "../config/config.module";
import { FileSystemService } from "./file-system.service";
import { LocalStorage } from "./local-storage";

@Module({
  imports: [ConfigModule],
  providers: [FileSystemService, LocalStorage],
  exports: [FileSystemService, LocalStorage],
})
export class FileSystemModule {}
