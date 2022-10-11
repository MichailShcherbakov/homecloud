import { Module } from "@nestjs/common";
import { AppContoller } from "./app.controller";
import { StorageModule } from "./storage";
import * as path from "path";
import { ServeStaticModule } from "@nestjs/serve-static";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname),
    }),
    StorageModule,
  ],
  controllers: [AppContoller],
})
export class AppModule {}
