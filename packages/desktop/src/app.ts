import { INestApplication } from "@nestjs/common";
import { AppModule } from "./modules/app.module";
import { createApp } from "./utils/createApp";

let app: INestApplication;

export async function bootstrap() {
  return await createApp(AppModule);
}

export async function shutdown() {
  await app.close();
}
