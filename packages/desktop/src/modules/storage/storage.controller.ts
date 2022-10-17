import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  Res,
} from "@nestjs/common";
import { createReadStream } from "fs";
import { StorageService } from "./storage.service";
import type { Request, Response } from "express";

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

  @Get("/dirs/:uuid")
  getDirEntities(@Param("uuid", ParseUUIDPipe) uuid: string) {
    return this.storageService.getDirEntities(uuid);
  }

  @Get("/files/:uuid/:segment")
  async getFileSegment(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Param("segment") segment: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const path = `C:/Users/Michail/Downloads/homecloud/media/sample_1280x720_surfing_with_audio-test/${segment}`;

    res.contentType("video/MP2T");

    createReadStream(path).pipe(res);
  }

  @Get("/files/:uuid")
  async getFile(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    /* const path = await this.storageService.getGlobaFilePath(uuid); */
    const path =
      "C:/Users/Michail/Downloads/homecloud/media/sample_1280x720_surfing_with_audio-test/sample_1280x720_surfing_with_audio-test.m3u8";

    res.contentType("application/vnd.apple.mpegurl");

    createReadStream(path).pipe(res);
  }
}
