import { StyleSheet, View } from 'react-native';

import IconSvg from './src/assets/logo_24dp.svg';

export default function App() {
  return (
    <View style={styles.container}>
      <IconSvg />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
