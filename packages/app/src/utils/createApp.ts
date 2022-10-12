import { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

export async function createApp<M>(appModule: M): Promise<INestApplication> {
  const app = await NestFactory.create(appModule);

  app.enableCors({
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    origin: "http://192.168.1.106:5173",
  });

  return app;
}
