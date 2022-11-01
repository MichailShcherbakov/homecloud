import { Logger, Module } from "@nestjs/common";
import { QueueModule } from "@server/modules/queue";
import { ConfigModule } from "@server/modules/config";
import { Converter } from "./converter.service";

@Module({
  imports: [QueueModule, ConfigModule],
  providers: [Converter, Logger],
  exports: [Converter],
})
export class ConverterModule {}
