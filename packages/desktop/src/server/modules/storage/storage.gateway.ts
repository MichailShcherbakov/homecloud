import { toJSON } from "@/server/utils/json";
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
import { StorageGatewayEventsEnum } from "./storage.events";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class StorageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly logger: Logger) {}

  @WebSocketServer()
  private readonly server: Server;

  handleConnection() {
    this.logger.log("Connected new client", StorageGateway.name);
  }

  handleDisconnect() {
    this.logger.log("Disconnected the client", StorageGateway.name);
  }

  @SubscribeMessage("storage.subs")
  private handleEvent(@MessageBody() data: string): string {
    return data;
  }

  public sendMessage<TData extends Record<string, any>>(
    type: StorageGatewayEventsEnum,
    data: TData
  ) {
    this.server.emit(type, data);

    this.logger.log(
      `Send message:\n - type: ${type}\n - data: ${toJSON(data)}`,
      StorageGateway.name
    );
  }
}
