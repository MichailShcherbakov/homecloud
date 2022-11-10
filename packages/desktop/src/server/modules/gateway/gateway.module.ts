import { Logger, Module } from "@nestjs/common";
import { GatewayService } from "./gateway.service";

@Module({
  providers: [Logger, GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
