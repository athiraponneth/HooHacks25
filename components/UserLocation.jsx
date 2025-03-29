import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

const getLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    
    return { latitude, longitude };
  } catch (error) {
    console.error('Error getting location:', error);
    alert('Error getting location');
    return null;
  }
};

const UserLocation = ({ navigation }) => {
  const handleLocationPress = async () => {
    const locationData = await getLocation();
    if (locationData) {
      navigation.navigate('Weather', { location: locationData });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Share Your Location</Text>
        <Text style={styles.subtitle}>
          Please enable location services to enhance your experience
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLocationPress}
        >
          <Text style={styles.buttonText}>Enable Location</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.navArrow} 
          onPress={() => navigation.navigate('TempPreviousScreen')} /*replace this w/ other screen*/
        >
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navArrow} 
          onPress={() => navigation.navigate('TempNextScreen')} /*replace this w/ other screen*/
        >
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  navArrow: {
    padding: 20,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserLocation;
