import { Controller, Get } from "@nestjs/common";
import { StorageService } from "./storage.service";

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
}
