import { TypeOrmModule } from "@nestjs/typeorm";
import { Logger, Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AppContoller } from "./app.controller";
import { ConverterModule } from "./converter";
import { StorageModule } from "./storage";
import { ConfigModule } from "./config";
import { QueueModule } from "./queue";
import { FileSystemModule } from "./file-system";
import { SyncModule } from "./sync/sync.module";
import { GatewayModule } from "./gateway/gateway.module";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      delimiter: ".",
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "homecloud.db.sqlite",
      autoLoadEntities: true,
      synchronize: true,
    }),
    QueueModule.forRoot(),
    ConfigModule,
    StorageModule,
    FileSystemModule,
    SyncModule,
    // ConverterModule,
    // GatewayModule,
  ],
  providers: [Logger],
  controllers: [AppContoller],
})
export class AppModule {}
