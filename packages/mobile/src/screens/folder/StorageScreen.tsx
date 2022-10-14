import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { AppBar } from "@components/AppBar";
import { StyleSheet } from "@theme/StyleSheet";
import { useGetRootEntities } from "@/hooks/useGetRootEntities";
import { Stack } from "@components/Stack";
import { EntityCard } from "@components/cards/EntityCard";

export interface StorageScreenProps {}

export const StorageScreen: React.FC<StorageScreenProps> = ({}) => {
  const { data = [] } = useGetRootEntities();
  const { styles } = useStyle();

  return (
    <SafeAreaView style={styles.root}>
      <AppBar />
      <ScrollView style={styles.container}>
        <Stack column gap={3}>
          {data.map(entity => (
            <EntityCard key={entity.uuid} entity={entity} />
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
