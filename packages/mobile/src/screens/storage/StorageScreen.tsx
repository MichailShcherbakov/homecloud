import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { AppBar } from "@components/AppBar";
import { StyleSheet } from "@theme/StyleSheet";
import { useGetRootEntities } from "@/hooks/useGetRootEntities";
import { Stack } from "@components/Stack";
import { EntityCard } from "@components/cards/EntityCard";
import { NavigationProp } from "@react-navigation/native";

export interface StorageScreenProps {
  navigation: NavigationProp<any>;
}

export const StorageScreen: React.FC<StorageScreenProps> = ({ navigation }) => {
  const { data = [] } = useGetRootEntities();
  const { styles } = useStyle();

  const onCardPress = React.useCallback(
    (entity: Entity) => {
      navigation.navigate("Folder");
    },
    [navigation]
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
