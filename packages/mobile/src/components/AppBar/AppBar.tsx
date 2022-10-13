import React from "react";
import { Text, View } from "react-native";

import LogoIcon from "../../assets/logo-x24.svg";

export const AppBar: React.FC<{}> = () => {
  return (
    <View>
      <LogoIcon width={48} height={48} />
      <Text>Test App Bar</Text>
    </View>
  );
};
