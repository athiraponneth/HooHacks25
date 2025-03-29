import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  ScrollView,
  Linking,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { searchOutfitPhotos } from './pexels';

export default function OutfitSearchScreen({ navigation }) { // Fix navigation prop
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const photos = await searchOutfitPhotos('red hoodie outfit');
      console.log('Pexels results:', photos);
      setResults(photos);
    } catch (err) {
      console.error('Error fetching from Pexels:', err);
    }
  };

  return (
    <>
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

      {/* Navigation Arrows */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navArrow} onPress={() => navigation.navigate('UserLocation')}>
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navArrow} onPress={() => navigation.navigate('WardrobeUpload')}>
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>r
      </View>
    </>
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
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  navArrow: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  arrowText: {
    fontSize: 20,
  },
});

