import { Logger, Module } from "@nestjs/common";
import { QueueModule } from "@server/modules/queue";
import { ConfigModule } from "@server/modules/config";
import { Converter } from "./converter.service";
import { StorageModule } from "@server/modules/storage";
import { ConverterWorker } from "./converter.worker";

@Module({
  imports: [
    StorageModule,
    QueueModule.registerQueue({
      name: "converter",
      concurrency: 5,
    }),
    ConfigModule,
  ],
  providers: [Logger, Converter, ConverterWorker],
  exports: [Converter],
})
export class ConverterModule {}
