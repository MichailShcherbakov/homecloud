import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { AppBar } from "@components/AppBar";
import { StyleSheet } from "@theme/StyleSheet";
import { Stack } from "@components/Stack";
import { EntityCard } from "@components/cards/EntityCard";
import { useGetCurrentDirectoryEntities } from "@/hooks/useGetCurrentDirectoryEntities";

export interface DirectoryScreenProps {}

export const DirectoryScreen: React.FC<DirectoryScreenProps> = ({}) => {
  const { data = [] } = useGetCurrentDirectoryEntities();
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
