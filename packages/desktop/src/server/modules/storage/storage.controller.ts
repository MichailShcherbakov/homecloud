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
import { join, sep } from "path";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { UploadDto } from "./storage.dto";
import { v4 as uuidv4 } from "uuid";
import { Statistics } from "./storage.type";
import { FileEntity } from "@/server/db/entities/file.entity";
import { DirectoryEntity } from "@/server/db/entities/directory.entity";

@Controller("/storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get("/statistics")
  getStatistics(): Promise<Statistics> {
    return this.storageService.getStatistics();
  }

  @Get("/")
  getRootEntities(): Promise<(FileEntity | DirectoryEntity)[]> {
    return this.storageService.getRootEntities();
  }

  @Get("/dirs/:uuid")
  getDirectoryEntities(
    @Param("uuid", ParseUUIDPipe) uuid: string
  ): Promise<(FileEntity | DirectoryEntity)[]> {
    return this.storageService.getDirEntities(uuid);
  }

  @Get("/files/:uuid")
  async getFile(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Res() res: Response
  ): Promise<void> {
    const path = await this.storageService.getGlobalFilePath(uuid);

    res.contentType("application/vnd.apple.mpegurl");

    createReadStream(path).pipe(res);
  }

  @Get("/files/:uuid/:segment")
  async getFileSegment(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Param("segment") segment: string,
    @Res() res: Response
  ): Promise<void> {
    const path = await this.storageService.getGlobalFilePath(uuid);
    const rawPath = path.split(sep);

    rawPath.pop();

    const segmentPath = join(rawPath.join(sep), segment);

    res.contentType("video/MP2T");

    createReadStream(segmentPath).pipe(res);
  }

  @Get("/path-to/:uuid")
  getPathToDir(
    @Param("uuid", ParseUUIDPipe) uuid: string
  ): Promise<DirectoryEntity[]> {
    return this.storageService.getAncestorsDirectory(uuid);
  }

  @Get("/upload")
  getUploadEntities(): Promise<(FileEntity | DirectoryEntity)[]> {
    return this.storageService.getUploadEntities();
  }

  @Post("/upload")
  @UseInterceptors(
    FileInterceptor("files", {
      limits: {
        fileSize: 5 * 1024 * 1024 * 1024, /// 5 Gb
      },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = process.env.TEMP_DIST as string;

          if (!existsSync(uploadPath)) mkdirSync(uploadPath);

          cb(null, uploadPath);
        },
        filename: (_req, _file, cb) => {
          cb(null, uuidv4());
        },
      }),
    })
  )
  async upload(
    @UploadedFile() files: Array<Express.Multer.File>,
    @Body() body: UploadDto
  ): Promise<void> {
    const { destination } = body;

    await this.storageService.upload({
      files,
      destination,
    });
  }
}
