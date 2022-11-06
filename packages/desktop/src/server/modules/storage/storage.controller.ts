import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { createReadStream, existsSync, mkdirSync } from "fs";
import { StorageService } from "./storage.service";
import type { Response } from "express";
import { join } from "path";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { ConfigService } from "../config/config.service";
import { UploadDto } from "./storage.dto";

@Controller("/storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get("/statistics")
  getStatistics() {
    return this.storageService.getStatistics();
  }

  @Get("/")
  getRootEntities() {
    return this.storageService.getRootEntities();
  }

  @Get("/path-to/:uuid")
  getPathToDir(@Param("uuid", ParseUUIDPipe) uuid: string) {
    return this.storageService.getPathToDir(uuid);
  }

  @Get("/dirs/:uuid")
  getDirEntities(@Param("uuid", ParseUUIDPipe) uuid: string) {
    return this.storageService.getDirEntities(uuid);
  }

  @Get("/upload")
  getUploadEntities() {
    return this.storageService.getUploadEntities();
  }

  @Post("/upload")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 5 * 1024 * 1024 * 1024, /// 5 Gb
      },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(__dirname, "tmp");

          if (!existsSync(uploadPath)) mkdirSync(uploadPath);

          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    })
  )
  async uploadEntity(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: UploadDto
  ): Promise<void> {
    const { target, destination } = body;

    console.log(file, body);

    await this.storageService.upload({
      file,
    });
  }

  @Get("/files/:uuid/:segment")
  async getFileSegment(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Param("segment") segment: string,
    @Res() res: Response
  ) {
    const path = await this.storageService.getGlobaFilePath(uuid);
    const rawPath = path.replaceAll("\\", "/").split("/");

    rawPath.pop();

    const segmentPath = join(rawPath.join("/"), segment);

    res.contentType("video/MP2T");

    createReadStream(segmentPath).pipe(res);
  }

  @Get("/files/:uuid")
  async getFile(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Res() res: Response
  ) {
    const path = await this.storageService.getGlobaFilePath(uuid);

    res.contentType("application/vnd.apple.mpegurl");

    createReadStream(path).pipe(res);
  }
}
