// OutfitSearchScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  ScrollView,
  Linking,
  StyleSheet,
} from 'react-native';
import { searchOutfitPhotos } from './pexels';

export default function OutfitSearchScreen() {
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const photos = await searchOutfitPhotos('red hoodie outfit');
      console.log('Pexels results:', photos); // See this in terminal
      setResults(photos);
    } catch (err) {
      console.error('Error fetching from Pexels:', err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pexels Outfit Search</Text>
      <Button title="Search for Outfits" onPress={handleSearch} />

      {results.map((photo) => (
        <View key={photo.id} style={styles.result}>
          <Text>{photo.title}</Text>
          <Image source={{ uri: photo.imageUrl }} style={styles.image} />
          <Button title="View on Pexels" onPress={() => Linking.openURL(photo.link)} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  result: {
    marginBottom: 30,
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginVertical: 10,
  },
});
