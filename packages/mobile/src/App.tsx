import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { HostsScreen } from "./screens/hosts/HostsScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./store";
import { StorageScreen } from "./screens/storage/StorageScreen";
import { QueryClient, QueryClientProvider } from "react-query";
import { DirectoryScreen } from "./screens/directory/DirectoryScreen";

const Stack = createNativeStackNavigator();

const queryClient = new QueryClient();

export const App: React.FC<{}> = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Hosts"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Hosts" component={HostsScreen} />
              <Stack.Screen name="Storage" component={StorageScreen} />
              <Stack.Screen name="Directory" component={DirectoryScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </ReduxProvider>
    </QueryClientProvider>
  );
};

export default App;
