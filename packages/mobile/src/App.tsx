import React from "react";
import { ScrollView, View } from "react-native";
import { AppBar } from "@components/AppBar";
import { HostCard } from "@components/cards/HostCard";
import { Stack } from "@components/Stack";
import { NerworkScanLoader } from "@components/loaders/NetworkScan";
import { StyleSheet } from "@theme/StyleSheet";

export const App: React.FC<{}> = () => {
  const { styles } = useStyle();
  return (
    <View style={styles.root}>
      <AppBar />
      <ScrollView style={styles.container}>
        {/* <NerworkScanLoader /> */}
        <Stack column gap={3}>
          <HostCard
            name="Inner Host"
            ip="192.168.1.106"
            dirs={2}
            files={15}
            space={29.642587}
            variant="fill"
          />
        </Stack>
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
