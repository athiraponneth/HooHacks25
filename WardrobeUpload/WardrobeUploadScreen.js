import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WardrobeUpload from "./WardrobeUpload/WardrobeUpload"; // Assuming this is the existing wardrobe upload component

const WardrobeUploadScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Your Wardrobe</Text>
      <WardrobeUpload />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default WardrobeUploadScreen;
