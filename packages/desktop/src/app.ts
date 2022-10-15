import { INestApplication } from "@nestjs/common";
import { AppModule } from "./modules/app.module";
import { createApp } from "./utils/createApp";

let app: INestApplication;

export async function bootstrap() {
  app = await createApp(AppModule);

  await app.listen(12536);
}

export async function shutdown() {
  await app.close();
}
