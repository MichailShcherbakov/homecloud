import React from "react";
import { Pressable, Text, ViewStyle } from "react-native";

import { StyleSheet } from "@/theme/StyleSheet";
import { Stack } from "@/components/Stack";

import CloudIcon from "@/assets/cloud_black_48dp.svg";
import SpaceIcon from "@/assets/donut_large_black_24dp.svg";
import FileIcon from "@/assets/description_black_24dp.svg";
import FolderIcon from "@/assets/folder_black_24dp.svg";
import { Host } from "@/utils/network-scan/scan-hosts";
import { compressBitesWithDimension } from "@/utils/compressBites";

interface StyleProps {
  variant?: "fill" | "text";
}

export interface HostCardProps extends StyleProps {
  host: Host;
  style?: ViewStyle;
  onPress?: (host: Host) => void;
}

export const HostCard: React.FC<HostCardProps> = props => {
  const { host, style, variant, onPress } = props;

  const { styles, cx } = useStyle({
    variant: variant ?? "text",
  });

  return (
    <Pressable onPress={() => onPress?.(host)}>
      <Stack column style={cx([styles.root, style])} gap={2}>
        <Stack row>
          <CloudIcon style={styles.icon} />
        </Stack>
        <Stack column>
          <Text style={styles.title}>{host.name}</Text>
          <Text style={styles.subtitle}>{host.ip}</Text>
        </Stack>
        <Stack row gap={1}>
          <Stack
            column
            alignItems="center"
            justifyContent="center"
            style={styles.option}
            gap={1}
          >
            <FolderIcon style={styles.optionIcon} />
            <Text style={styles.optionTitle}>
              {host.totalDirsCount} Folders
            </Text>
          </Stack>
          <Stack
            column
            alignItems="center"
            justifyContent="center"
            style={styles.option}
            gap={1}
          >
            <FileIcon style={styles.optionIcon} />
            <Text style={styles.optionTitle}>{host.totalFileCount} Files</Text>
          </Stack>
          <Stack
            column
            alignItems="center"
            justifyContent="center"
            style={styles.option}
            gap={1}
          >
            <SpaceIcon style={styles.optionIcon} />
            <Text style={styles.optionTitle}>
              {compressBitesWithDimension(host.totalSpaceUsed)}
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Pressable>
  );
};

const useStyle = StyleSheet<StyleProps>()(({ theme, props: { variant } }) => ({
  root: {
    backgroundColor:
      variant === "fill"
        ? theme.palette.primary.main
        : theme.palette.background.default,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.palette.divider,
  },
  icon: {
    width: 48,
    height: 48,
    color:
      variant === "fill"
        ? theme.palette.background.default
        : theme.palette.primary.main,
  },
  title: {
    color:
      variant === "fill"
        ? theme.palette.text.secondary
        : theme.palette.text.primary,
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color:
      variant === "fill"
        ? theme.palette.text.secondary
        : theme.palette.text.primary,
    fontSize: 12,
    fontWeight: "400",
  },
  option: {
    minWidth: 84,
    minHeight: 84,
    maxWidth: 84,
    maxHeight: 84,
    backgroundColor:
      variant === "fill"
        ? theme.palette.primary.dark
        : theme.palette.secondary.light,
    borderRadius: 12,
  },
  optionIcon: {
    width: 24,
    height: 24,
    color:
      variant === "fill"
        ? theme.palette.primary.light
        : theme.palette.secondary.dark,
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color:
      variant === "fill"
        ? theme.palette.primary.light
        : theme.palette.secondary.dark,
  },
}));
