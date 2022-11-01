import { TypeOrmModule } from "@nestjs/typeorm";
import { Logger, Module } from "@nestjs/common";
import { AppContoller } from "./app.controller";
import { ConverterModule } from "./converter";
import { StorageModule } from "./storage";
import { ConfigModule } from "./config";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "homecloud.sqlite",
      autoLoadEntities: true,
      synchronize: true,
    }),
    ConfigModule,
    // StorageModule,
    // ConverterModule,
  ],
  providers: [Logger],
  controllers: [AppContoller],
})
export class AppModule {}
