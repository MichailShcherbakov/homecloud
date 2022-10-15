import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { AppBar } from "@/components/AppBar";
import { StyleSheet } from "@/theme/StyleSheet";
import { Stack } from "@/components/Stack";
import { EntityCard } from "@/components/cards/EntityCard";
import { useGetCurrentDirectoryEntities } from "@/hooks/useGetCurrentDirectoryEntities";
import { Entity } from "@/types";
import { NavigationProp } from "@react-navigation/native";
import { useCurrentDirectory } from "@/hooks/useCurrentDirectory";

export interface DirectoryScreenProps {
  navigation: NavigationProp<any>;
}

export const DirectoryScreen: React.FC<DirectoryScreenProps> = ({
  navigation,
}) => {
  const { setCurrentDirectory } = useCurrentDirectory();
  const { data = [] } = useGetCurrentDirectoryEntities();
  const { styles } = useStyle();

  const onCardPress = React.useCallback(
    (entity: Entity) => {
      if (entity.isFile) {
        navigation.navigate("VideoPlayer", {
          videoFile: entity,
        });
        return;
      }

      setCurrentDirectory(entity);

      navigation.navigate("Directory");
    },
    [navigation, setCurrentDirectory]
  );

  return (
    <SafeAreaView style={styles.root}>
      <AppBar />
      <ScrollView style={styles.container}>
        <Stack column gap={3}>
          {data.map(entity => (
            <EntityCard
              key={entity.uuid}
              entity={entity}
              onPress={onCardPress}
            />
          ))}
        </Stack>
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
