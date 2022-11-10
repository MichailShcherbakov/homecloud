import { GatewayEventsEnum } from "@/server/modules/gateway/gateway.events";
import React from "react";
import { io, Socket } from "socket.io-client";

export interface SubscriptionsContextType {
  socket: Socket;
}

const initilaContext: SubscriptionsContextType = {} as SubscriptionsContextType;

const SubscriptionsContext = React.createContext(initilaContext);

export const SubscriptionsProvider = SubscriptionsContext.Provider;

export function useSocket() {
  return React.useMemo(() => {
    const socket = io("http://localhost:12536/");

    socket.on("connect", () => {
      console.log(socket.id);
    });

    socket.on("disconnect", () => {
      console.log(socket.id);
    });

    return socket;
  }, []);
}

export function useSubscribe<TData extends Record<string, any>>(
  type: GatewayEventsEnum,
  callback: (data: TData) => void
) {
  const ctx = React.useContext(SubscriptionsContext);

  const cb = React.useCallback(callback, []);

  React.useEffect(() => {
    ctx.socket.on(type, cb);

    return () => {
      ctx.socket.off(type, cb);
    };
  }, [ctx]);
}
