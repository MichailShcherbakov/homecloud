import { INestApplication } from "@nestjs/common";
import { AppModule } from "./modules/app.module";
import { createApp } from "./utils/createApp";

export async function bootstrap() {
  return await createApp(AppModule);
}

export async function shutdown(app: INestApplication) {
  await app.close();
}