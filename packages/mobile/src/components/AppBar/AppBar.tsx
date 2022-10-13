import React from "react";
import { StyleSheet, Text } from "react-native";

import LogoIcon from "@assets/logo-x24";
import { Stack } from "@components/Stack";

import SettingsIcon from "@assets/settings_black_24dp.svg";

export const AppBar: React.FC<{}> = () => {
  return (
    <Stack
      row
      alignItems="center"
      justifyContent="space-between"
      fullWidth
      style={styles.root}
    >
      <Stack row alignItems="center">
        <LogoIcon style={styles.logoIcon} width={28} height={28} />
        <Text style={styles.logoTitle}>Home Cloud</Text>
      </Stack>
      <Stack row alignItems="center">
        <SettingsIcon width={24} height={24} style={styles.settingsIcon} />
      </Stack>
    </Stack>
  );
};

const styles = StyleSheet.create({
  root: {
    padding: 24,
  },
  logoIcon: {
    marginRight: 16,
  },
  logoTitle: {
    color: "#2262C6",
    fontSize: 20,
    fontWeight: "700",
  },
  settingsIcon: {
    color: "#2262C6",
  },
});
