import React from "react";
import { Text } from "react-native";
import { Stack } from "@/components/Stack";
import LogoIcon from "@/assets/logo_24dp.svg";
import SettingsIcon from "@/assets/settings_black_24dp.svg";
import { StyleSheet } from "@/theme/StyleSheet";

export const AppBar: React.FC<{}> = () => {
  const { styles } = useStyle();
  return (
    <Stack
      row
      alignItems="center"
      justifyContent="space-between"
      fullWidth
      style={styles.root}
    >
      <Stack row alignItems="center">
        <LogoIcon style={styles.logoIcon} />
        <Text style={styles.logoTitle}>Home Cloud</Text>
      </Stack>
      <Stack row alignItems="center">
        <SettingsIcon width={24} height={24} color="#2262C6" />
      </Stack>
    </Stack>
  );
};

const useStyle = StyleSheet()(({ theme }) => ({
  root: {
    padding: theme.spacing(3),
  },
  logoIcon: {
    width: 28,
    height: 28,
    marginRight: theme.spacing(2),
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2262C6",
  },
}));
