import React from "react";
import { ScrollView, View } from "react-native";
import { AppBar } from "@components/AppBar";
import { HostCard } from "@components/cards/HostCard";
import { Stack } from "@components/Stack";
import { NerworkScanLoader } from "@components/loaders/NetworkScan";
import { StyleSheet } from "@theme/StyleSheet";
import { useNetworkScan } from "@/utils/network-scan/useNetworkScan";

export const App: React.FC<{}> = () => {
  const { styles } = useStyle();
  const { isScanning, hosts } = useNetworkScan();

  console.log(isScanning);

  return (
    <View style={styles.root}>
      <AppBar />
      <ScrollView style={styles.container}>
        {isScanning && <NerworkScanLoader />}
        {!isScanning && (
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
    </View>
  );
};

const useStyle = StyleSheet()(() => ({
  root: {
    height: "100%",
  },
  container: {
    paddingHorizontal: 24,
  },
}));

export default App;
