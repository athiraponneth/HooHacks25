import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import WardrobeUpload from "./WardrobeUpload/WardrobeUpload"

export default function App() {
  return (
    <View style={styles.container}>
      <WardrobeUpload/>
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
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});