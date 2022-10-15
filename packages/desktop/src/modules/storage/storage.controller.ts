import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  Res,
} from "@nestjs/common";
import { createReadStream, statSync } from "fs";
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

  @Get("/files/:uuid")
  async getFile(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const path = await this.storageService.getGlobaFilePath(uuid);

    const stat = statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = createReadStream(path, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      createReadStream(path).pipe(res);
    }
  }
}
