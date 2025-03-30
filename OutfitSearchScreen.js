import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Linking,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { getLocation } from './components/UserLocation';
import { searchOutfitPhotos } from './pexels';
import * as Location from 'expo-location';

const API_KEY = 'INSERT_API_KEY';
const TOGETHER_API_KEY = 'iNSERT_API_KEY';

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('Route Params:', route.params);
    fetchWeather();
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
      generateSearchQuery(result);
    } catch (error) {
      setErrorMsg('Error fetching weather data');
    }
  };

  async function generateSearchQuery(weatherData) { 
    if (!weatherData || !weatherData.daily) return;

    const weatherCode = weatherData.daily.weathercode[0];
    const weatherDescription = getWeatherDescription(weatherCode);

    const prompt = `outfits with ${clothingColor || ''} ${clothingItem || ''}`.trim();
    console.log("Search prompt:", prompt);
    //comment
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
        setSearchQuery(prompt);
    }
  }

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      if (!searchQuery) {
        if (weather) await generateSearchQuery(weather);
        else {
          setErrorMsg('Weather data is not available');
          setIsLoading(false);
          return;
        }
      }
      
      const photos = await searchOutfitPhotos(searchQuery);
      setResults(photos);
    } catch (err) {
      console.error('Error fetching from Pexels:', err);
      setErrorMsg('Error finding outfit ideas');
    } finally {
      setIsLoading(false);
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>oops!</Text>
          <Text style={styles.subtitle}>{errorMsg}</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>loading</Text>
          <ActivityIndicator size="large" color="#A47551" style={styles.loadingIndicator} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>today's weather</Text>
          
          <View style={styles.weatherContainer}>
            <Text style={styles.weatherText}>
              {getWeatherDescription(weather.daily.weathercode[0])}
            </Text>
            <Text style={styles.tempText}>
              {weather.daily.temperature_2m_max[0]}°C high / {weather.daily.temperature_2m_min[0]}°C low
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleSearch}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
            {isLoading ? 'searching...' : `find outfit ideas with your ${clothingColor} ${clothingItem}`}
          </Text>
          </TouchableOpacity>
          
          {isLoading && (
            <ActivityIndicator size="large" color="#A47551" style={styles.loadingIndicator} />
          )}
          
          {results.length > 0 && (
            <Text style={styles.resultsTitle}>outfit inspiration</Text>
          )}
          
          {results.map((photo) => (
            <View key={photo.id} style={styles.resultCard}>
              <Image source={{ uri: photo.imageUrl }} style={styles.image} />
              <Text style={styles.photoTitle}>{photo.title}</Text>
              <TouchableOpacity 
                style={styles.viewButton}
                onPress={() => Linking.openURL(photo.link)}
              >
                <Text style={styles.viewButtonText}>view on pexels</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.navArrow}
          onPress={() => navigation.navigate('WardrobeUpload')}
        >
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navArrow}
          onPress={() => navigation.navigate('LandingPage')}
        >
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7E6D4',
    padding: 20,
    paddingTop: 120,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 60,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 40,
    gap: 40,
  },
  navArrow: {
    backgroundColor: '#E76F51',
    padding: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Avenir-Medium',
  },
  title: {
    fontSize: 28,
    color: '#5C6B73',
    marginBottom: 20,
    fontWeight: '600',
    fontFamily: 'Avenir-Medium',
    textAlign: 'center',
  },
  resultsTitle: {
    fontSize: 24,
    color: '#5C6B73',
    marginTop: 30,
    marginBottom: 15,
    fontWeight: '600',
    fontFamily: 'Avenir-Medium',
  },
  subtitle: {
    fontSize: 16,
    color: '#457B9D',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Avenir',
    paddingHorizontal: 20,
  },
  weatherContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  weatherText: {
    fontSize: 20,
    color: '#5C6B73',
    fontWeight: '500',
    fontFamily: 'Avenir-Medium',
    marginBottom: 8,
  },
  tempText: {
    fontSize: 16,
    color: '#457B9D',
    fontFamily: 'Avenir',
  },
  button: {
    backgroundColor: '#E76F51',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Avenir-Medium',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    width: '90%',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginVertical: 10,
  },
  photoTitle: {
    fontSize: 16,
    color: '#5C6B73',
    fontFamily: 'Avenir',
    marginVertical: 10,
    textAlign: 'center',
  },
  viewButton: {
    backgroundColor: '#E76F51',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 5,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Avenir-Medium',
  }
});
