import { JobEntity } from "@/server/db/entities/job.entity";
import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QueueManager } from "./queue.manager";

@Module({
  imports: [TypeOrmModule.forFeature([JobEntity])],
  providers: [QueueManager, Logger],
  exports: [QueueManager],
})
export class QueueModule {}
