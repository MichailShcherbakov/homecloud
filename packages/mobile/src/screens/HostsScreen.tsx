import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AppBar } from "@/components/AppBar";
import { HostCard } from "@/components/cards/HostCard";
import { NerworkScanLoader } from "@/components/loaders/NetworkScan";
import { NotFoundHosts } from "@/components/banners/NotFoundHosts";
import { StyleSheet } from "@/theme/StyleSheet";
import { useNetworkScan } from "@/utils/network-scan/useNetworkScan";
import { Stack } from "@/components/Stack";
import { NavigationProp } from "@react-navigation/native";
import { Host } from "@/utils/network-scan/scan-hosts";
import { useCurrentHost } from "@/hooks/useCurrentHost";

export interface HostsScreenProps {
  navigation: NavigationProp<any>;
}

export const HostsScreen: React.FC<HostsScreenProps> = ({ navigation }) => {
  const { styles } = useStyle();
  const { setCurrentHost } = useCurrentHost();
  const { isScanning, hosts } = useNetworkScan();

  const isEmpty = !hosts.length;

  const onCardPress = React.useCallback(
    (host: Host) => {
      setCurrentHost(host);

      navigation.navigate("Storage");
    },
    [navigation, setCurrentHost]
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="auto" translucent={false} backgroundColor="#fff" />
      <AppBar />
      <ScrollView style={styles.container}>
        {isScanning && <NerworkScanLoader />}
        {!isScanning && isEmpty && <NotFoundHosts />}
        {!isScanning && !isEmpty && (
          <Stack column gap={3}>
            {hosts.map(host => (
              <HostCard
                key={host.name}
                host={host}
                variant="fill"
                onPress={onCardPress}
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
