import React from "react";
import { SafeAreaView } from "react-native";
import { StyleSheet } from "@/theme/StyleSheet";
import { NavigationProp } from "@react-navigation/native";
import { File } from "@/types";
import { useCurrentHost } from "@/hooks/useCurrentHost";
import { ResizeMode, Video } from "expo-av";

export interface VideoPlayerScreenProps {
  navigation: NavigationProp<any>;
  route: {
    params: {
      videoFile: File;
    };
  };
}

export const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({
  route: {
    params: { videoFile },
  },
}) => {
  const { styles } = useStyle();
  const { currentHost } = useCurrentHost();

  return (
    <SafeAreaView style={styles.root}>
      <Video
        style={styles.player}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        source={{
          uri: `http://${currentHost?.ip}:12536/storage/files/${videoFile.uuid}`,
        }}
        useNativeControls
      />
    </SafeAreaView>
  );
};

const useStyle = StyleSheet()(() => ({
  root: {
    flex: 1,
  },
  player: {
    flex: 1,
  },
}));
