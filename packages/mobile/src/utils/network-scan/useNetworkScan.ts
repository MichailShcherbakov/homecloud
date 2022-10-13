import React from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { Host, scanHosts } from "./scan-hosts";

export function useNetworkScan() {
  const [isScanning, setIsScanning] = React.useState(true);
  const [hosts, setHosts] = React.useState<Host[]>([]);

  const netIfno = useNetInfo();

  React.useEffect(() => {
    if (netIfno.type !== "wifi" || !netIfno.details.ipAddress) {
      console.log("here");
      setIsScanning(false);
      return;
    }

    setIsScanning(true);

    scanHosts(netIfno.details.ipAddress)
      .then(setHosts)
      .finally(() => {
        setIsScanning(false);
      });
  }, [netIfno]);

  return {
    isScanning,
    hosts,
  };
}
