import React, { useState, useEffect } from 'react';
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
import { getLocation } from './components/UserLocation';
import { searchOutfitPhotos } from './pexels';
import * as WardrobeUpload from './WardrobeUpload';
import * as Location from 'expo-location';

const API_KEY = '400c0b2f1c1c6dab405313f0d12dfe91';
const TOGETHER_API_KEY = 'fc64da8c593f8da107e5a6cbf3791925f81c87b66482dcdc90250752acc993a3';

const getWeatherDescription = (code) => {
  const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return weatherCodes[code] || 'Unknown weather condition';
};

export default function OutfitSearchScreen({ navigation, route }) {
  const { clothingItem, clothingColor } = route.params || {};

  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log('Route Params:', route.params);
    fetchWeather();
    generateSearchQuery();
  }, []);

  const fetchWeather = async () => {
    const coords = await getLocation();
    if (!coords) {
      setErrorMsg('Failed to get location');
      return;
    }
    
    const [latitude, longitude] = coords;
    setLocation({ latitude, longitude });
    
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=1`
      );
      const result = await response.json();
      setWeather(result);
    } catch (error) {
      setErrorMsg('Error fetching weather data');
    }
  };

  async function generateSearchQuery() { 
    console.log("promt" + clothingItem + " " + clothingColor )

    prompt = "white shirt and blue jeans"
    console.log(prompt)
    
    try {
        const response = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOGETHER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistralai/Mistral-7B-Instruct-v0.1',
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 20
            })
        });

        const data = await response.json();
        setSearchQuery(data.choices[0].message.content.trim());
    } catch (error) {
        console.error('Error generating search query:', error);
    }
  }

  const handleSearch = async () => {
    console.log(clothingItem + " " + clothingColor)

    try {
      if (!searchQuery) await generateSearchQuery();
      const photos = await searchOutfitPhotos(searchQuery);
      setResults(photos);
    } catch (err) {
      console.error('Error fetching from Pexels:', err);
    }
  };

  if (errorMsg) {
    return <Text>{errorMsg}</Text>;
  }

  if (!weather) {
    return <Text>Loading weather data...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Today's Weather</Text>
      <Text>High: {weather.daily.temperature_2m_max[0]}°C</Text>
      <Text>Low: {weather.daily.temperature_2m_min[0]}°C</Text>
      <Text>Weather: {getWeatherDescription(weather.daily.weathercode[0])}</Text>
      
      <Text style={styles.title}>Pexels Outfit Search</Text>
      <Button title="Search for Outfits" onPress={handleSearch} />
      {results.map((photo) => (
        <View key={photo.id} style={styles.result}>
          <Text>{photo.title}</Text>
          <Image source={{ uri: photo.imageUrl }} style={styles.image} />
          <Button title="View on Pexels" onPress={() => Linking.openURL(photo.link)} />
        </View>
      ))}

      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navArrow} onPress={() => navigation.navigate('UserLocation')}>
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navArrow} onPress={() => navigation.navigate('WardrobeUpload')}>
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>
      </View>
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
