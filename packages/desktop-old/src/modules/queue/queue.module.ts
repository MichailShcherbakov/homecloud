import { Module } from "@nestjs/common";
import { QueueManager } from "./queue.manager";

@Module({
  providers: [QueueManager],
  exports: [QueueManager],
})
export class QueueModule {}
