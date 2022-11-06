import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as winston from "winston";
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from "nest-winston";

export interface IApplication extends INestApplication {}

export async function createApp<M>(rootModule: M): Promise<IApplication> {
  const instance = await NestFactory.create(rootModule, {
    logger: WinstonModule.createLogger({
      instance: winston.createLogger({
        level: "info",
        format: winston.format.json(),
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              nestWinstonModuleUtilities.format.nestLike("App", {
                colors: true,
                prettyPrint: true,
              })
            ),
          }),
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

  instance.useGlobalPipes(new ValidationPipe());

  instance.enableCors({
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    origin: "*",
  });

  instance.enableShutdownHooks();

  return instance;
}
