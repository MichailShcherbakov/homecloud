import { toJSON } from "@/server/utils/format/json";
import { Logger } from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { GatewayEventsEnum } from "./gateway.events";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class GatewayService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly logger: Logger) {}

  @WebSocketServer()
  private readonly server: Server;

  handleConnection() {
    this.logger.log("Connected new client", GatewayService.name);
  }

  handleDisconnect() {
    this.logger.log("Disconnected the client", GatewayService.name);
  }

  @SubscribeMessage("storage.subs")
  private handleEvent(@MessageBody() data: string): string {
    return data;
  }

  private sendMessage<TData extends Record<string, any>>(
    type: GatewayEventsEnum,
    data: TData
  ) {
    this.server.emit(type, data);

    this.logger.log(
      `Send message:\n - type: ${type}\n - data: ${toJSON(data)}`,
      GatewayService.name
    );
  }
}
