import React from "react";
import { Stack } from "@components/Stack";
import FolderIcon from "@/assets/folder_black_24dp.svg";
import MovieIcon from "@/assets/movie_black_24dp.svg";
import { Pressable, Text, ViewStyle } from "react-native";
import { StyleSheet } from "@theme/StyleSheet";
import { Entity } from "@/types";
import { compressBitesWithDimension } from "@/utils/compressBites";

export interface EntityCardProps {
  entity: Entity;
  style?: ViewStyle;
  onPress?: (entity: Entity) => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  entity,
  style,
  onPress,
}) => {
  const { cx, styles } = useStyle();
  return (
    <Pressable onPress={() => onPress?.(entity)}>
      <Stack row alignItems="center" style={cx([styles.root, style])} gap={2}>
        <Stack>
          {entity.isDirectory ? (
            <FolderIcon style={styles.icon} />
          ) : (
            <MovieIcon style={styles.icon} />
          )}
        </Stack>
        <Stack column flex={1}>
          <Stack row>
            <Text numberOfLines={1} ellipsizeMode={"tail"} style={styles.title}>
              {entity.name}
            </Text>
          </Stack>
          <Stack row>
            <Text
              numberOfLines={1}
              ellipsizeMode={"tail"}
              style={styles.subtitle}
            >
              {compressBitesWithDimension(entity.size)}
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Pressable>
  );
};

const useStyle = StyleSheet()(({ theme }) => ({
  root: {
    paddingHorizontal: theme.spacing(1),
  },
  icon: {
    width: 24,
    height: 24,
    color: theme.palette.secondary.main,
  },
  title: {
    flex: 1,
    fontSize: 16,
    color: theme.palette.secondary.main,
  },
  subtitle: {
    flex: 1,
    fontSize: 12,
    color: theme.palette.secondary.main,
  },
}));
