import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppBar } from "@components/AppBar";
import { HostCard } from "@components/cards/HostCard";
import { Stack } from "@components/Stack";

export const App: React.FC<{}> = () => {
  return (
    <View>
      <AppBar />
      <ScrollView style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    height: "100%",
  },
});

export default App;
