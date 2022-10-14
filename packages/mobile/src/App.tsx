import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { HostsScreen } from "./screens/hosts/HostsScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export const App: React.FC<{}> = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Hosts"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Hosts" component={HostsScreen} />
          <Stack.Screen name="Storage" component={HostsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
