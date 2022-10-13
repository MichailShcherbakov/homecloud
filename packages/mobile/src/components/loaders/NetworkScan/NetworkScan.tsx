import React from "react";
import { Stack } from "@components/Stack";

import NetIcon from "@/assets/language_black_48dp.svg";
import { StyleSheet } from "@/theme/StyleSheet";
import { Text } from "react-native";

export const NerworkScanLoader = () => {
  const { styles } = useStyle();

  return (
    <Stack column alignItems="center" style={styles.root}>
      <Stack alignItems="center" column gap={2} style={styles.container}>
        <NetIcon style={styles.icon} />
        <Stack column alignItems="center" gap={0.25}>
          <Text style={styles.title}>Scaning yout network...</Text>
          <Text style={styles.subtitle}>It may takes a few seconds</Text>
        </Stack>
      </Stack>
    </Stack>
  );
};

const useStyle = StyleSheet()(({ theme }) => ({
  root: {
    height: "100%",
    padding: 16,
  },
  container: {
    paddingVertical: 64,
  },
  icon: {
    width: 48,
    height: 48,
    color: theme.palette.primary.main,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.palette.secondary.main,
  },
  subtitle: {
    fontSize: 14,
    color: "#A6B1C4",
  },
}));
