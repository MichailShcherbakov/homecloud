import { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as winston from "winston";
import { WinstonModule } from "nest-winston";

export interface IApplication extends INestApplication {}

export async function createApp<M>(rootModule: M): Promise<IApplication> {
  const instance = await NestFactory.create(rootModule, {
    logger: WinstonModule.createLogger({
      instance: winston.createLogger({
        level: "info",
        format: winston.format.json(),
        transports: [
          new winston.transports.File({
            dirname: "logs",
            filename: "error.log",
            level: "error",
          }),
          new winston.transports.File({
            dirname: "logs",
            filename: "combined.log",
          }),
        ],
      }),
    }),
  });

  instance.enableCors({
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    origin: "*",
  });

  instance.enableShutdownHooks();

  return instance;
}
