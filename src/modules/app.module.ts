import { Module } from "@nestjs/common";
import { AppContoller } from "./app.controller";

@Module({
  controllers: [AppContoller],
})
export class AppModule {}
