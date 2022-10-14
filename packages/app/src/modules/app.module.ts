import { Module } from "@nestjs/common";
import { AppContoller } from "./app.controller";
import { StorageModule } from "./storage";

@Module({
  imports: [StorageModule],
  controllers: [AppContoller],
})
export class AppModule {}
