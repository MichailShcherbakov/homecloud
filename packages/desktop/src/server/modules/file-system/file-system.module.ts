import { Module } from "@nestjs/common";
import { ConfigModule } from "../config/config.module";
import { FileSystemService } from "./file-system.service";

@Module({
  imports: [ConfigModule],
  providers: [FileSystemService],
  exports: [FileSystemService],
})
export class FileSystemModule {}
