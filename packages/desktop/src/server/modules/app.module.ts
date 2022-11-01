import { TypeOrmModule } from "@nestjs/typeorm";
import { Logger, Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AppContoller } from "./app.controller";
import { ConverterModule } from "./converter";
import { StorageModule } from "./storage";
import { ConfigModule } from "./config";

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
      database: "homecloud.sqlite",
      autoLoadEntities: true,
      synchronize: true,
    }),
    ConfigModule,
    ConverterModule,
    StorageModule,
  ],
  providers: [Logger],
  controllers: [AppContoller],
})
export class AppModule {}
