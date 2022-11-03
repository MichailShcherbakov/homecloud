import { Controller, Get, Param, ParseUUIDPipe, Res } from "@nestjs/common";
import { createReadStream } from "fs";
import { StorageService } from "./storage.service";
import type { Response } from "express";
import { join } from "path";

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
