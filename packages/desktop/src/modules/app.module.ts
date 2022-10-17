import { Module } from "@nestjs/common";
import { AppContoller } from "./app.controller";
import { ConverterModule } from "./converter";
import { StorageModule } from "./storage";

@Module({
  imports: [StorageModule, ConverterModule],
  controllers: [AppContoller],
})
export class AppModule {}
