import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { AppBar } from "@components/AppBar";
import { HostCard } from "@components/cards/HostCard";
import { NerworkScanLoader } from "@components/loaders/NetworkScan";
import { NotFoundHosts } from "@components/banners/NotFoundHosts";
import { StyleSheet } from "@theme/StyleSheet";
import { useNetworkScan } from "@/utils/network-scan/useNetworkScan";
import { Stack } from "@components/Stack";

export const HostsScreen: React.FC<{}> = () => {
  const { styles } = useStyle();
  const { isScanning, hosts } = useNetworkScan();
  const isEmpty = !hosts.length;
  return (
    <SafeAreaView style={styles.root}>
      <AppBar />
      <ScrollView style={styles.container}>
        {isScanning && <NerworkScanLoader />}
        {!isScanning && isEmpty && <NotFoundHosts />}
        {!isScanning && !isEmpty && (
          <Stack column gap={3}>
            {hosts.map(host => (
              <HostCard
                key={host.name}
                name={host.name}
                ip={host.ip}
                dirs={host.totalDirsCount}
                files={host.totalFileCount}
                space={host.totalSpaceUsed}
                variant="fill"
              />
            ))}
          </Stack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const useStyle = StyleSheet()(() => ({
  root: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 24,
  },
}));
