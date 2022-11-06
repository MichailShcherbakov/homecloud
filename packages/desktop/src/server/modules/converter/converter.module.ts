import { Logger, Module } from "@nestjs/common";
import { QueueModule } from "@server/modules/queue";
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
  ],
  providers: [Logger, Converter, ConverterWorker],
  exports: [Converter],
})
export class ConverterModule {}
