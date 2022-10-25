import { Module } from "@nestjs/common";
import { QueueModule } from "@/modules/queue";
import { ConfigModule } from "@/modules/config";
import { Converter } from "./converter";

@Module({
  imports: [QueueModule, ConfigModule],
  providers: [Converter],
  exports: [Converter],
})
export class ConverterModule {}
