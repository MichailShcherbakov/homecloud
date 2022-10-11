import { Controller, Get } from "@nestjs/common";

@Controller("/")
export class AppContoller {
  @Get("/status")
  getStatus() {
    return {
      status: "ok",
    };
  }
}
