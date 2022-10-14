import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrentHost } from "@/store/reducers/hosts.reducer";
import { Host } from "@/utils/network-scan/scan-hosts";
import React from "react";

export function useCurrentHost() {
  const currentHost = useAppSelector(state => state.hosts.currentHost);
  const dispatch = useAppDispatch();

  return {
    currentHost,
    setCurrentHost: React.useCallback(
      (host: Host) => dispatch(setCurrentHost(host)),
      [dispatch]
    ),
  };
}
