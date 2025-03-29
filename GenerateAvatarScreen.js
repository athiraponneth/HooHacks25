import React, { useState, useEffect } from 'react';
import { View, Button, Image, ActivityIndicator, StyleSheet, Dimensions, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

export default function GenerateAvatarScreen() {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [outfitDescription, setOutfitDescription] = useState("A white t-shirt and jeans with sneakers.");
  const [loading, setLoading] = useState(true);
  const [matchedOutfit, setMatchedOutfit] = useState(null);

  useEffect(() => {
    generateAvatar();
  }, []);

  const generateAvatar = async () => {
    try {
      const userId = Math.random().toString(36).substring(7);
      const url = `https://readyplayer.me/avatar?user=${userId}`;
      setAvatarUrl(url);
    } catch (error) {
      console.error('Error generating avatar:', error);
    } finally {
      setLoading(false);
    }
  };
  const findSimilarOutfit = async () => {
    try {
      // Simulated API call to search for a similar outfit in Ready Player Me wardrobe
      const response = await fetch('https://api.readyplayer.me/wardrobe/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: outfitDescription }),
      });
  
      // Check if response is OK (status code 200-299)
      if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
        return;
      }
  
      // Read the raw response text before attempting to parse it
      const rawResponse = await response.text();
      console.log("Raw Response:", rawResponse);
  
      // Try parsing the response as JSON
      let data = {};
      try {
        data = JSON.parse(rawResponse);
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        return;
      }
  
      // If response body is empty
      if (!data) {
        console.error('No data returned from API');
        return;
      }
  
      setMatchedOutfit(data.matchedOutfit); // Assuming matchedOutfit is a key in the API response
    } catch (error) {
      console.error('Error finding similar outfit:', error);
    }
  };
  
  useEffect(() => {
    if (outfitDescription) {
      findSimilarOutfit();
    }
  }, [outfitDescription]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.webviewContainer}>
          <WebView source={{ uri: avatarUrl }} style={styles.webview} />
        </View>
      )}
      <Button title="Search for Similar Outfit" onPress={findSimilarOutfit} />
      {matchedOutfit && <Text style={styles.matchText}>Matched Outfit: {matchedOutfit.name}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  webviewContainer: {
    width: width * 0.9,
    height: height * 0.6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  matchText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
