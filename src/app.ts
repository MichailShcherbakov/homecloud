import { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";

let app: INestApplication;

export async function bootstrap() {
  app = await NestFactory.create(AppModule);
  await app.listen(12536);
}

export async function shutdown() {
  await app.close();
}
