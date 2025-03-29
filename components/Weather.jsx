import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

const API_KEY='400c0b2f1c1c6dab405313f0d12dfe91' //BAD

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

export default function WeatherComponent() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let latitude = parseFloat(location.coords.latitude);
      let longitude = parseFloat(location.coords.longitude);
      setLocation(location);

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=38.0293&longitude=-78.4767&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=1`
        );
        const result = await response.json();
        setWeather(result);
      } catch (error) {
        setErrorMsg('Error fetching weather data');
      }
    })();
  }, []);

  if (errorMsg) {
    return <Text>{errorMsg}</Text>;
  }
  
  if (!weather) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text>High: {weather.daily.temperature_2m_max[0]}°C</Text>
      <Text>Low: {weather.daily.temperature_2m_min[0]}°C</Text>
      <Text>Weather: {getWeatherDescription(weather.daily.weathercode[0])}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});