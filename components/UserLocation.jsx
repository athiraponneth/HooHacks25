import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import SignInScreen from '../SignInScreen';
import WardrobeUpload from '../WardrobeUpload';

export const getLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    
    return [latitude, longitude];
  } catch (error) {
    console.error('Error getting location:', error);
    alert('Error getting location');
    return null;
  }
};

export const UserLocation = ({ navigation }) => {
  const handleLocationPress = async () => {
    const locationData = await getLocation();
    if (locationData) {
      console.log('Latitude:', locationData.latitude);
      console.log('Longitude:', locationData.longitude);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>share your location</Text>
        <Text style={styles.subtitle}>
          please enable location services to enhance your experience
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLocationPress}
        >
          <Text style={styles.buttonText}>enable location</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.navArrow} 
          onPress={() => navigation.navigate('LandingPage')}
        >
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navArrow} 
          onPress={() => navigation.navigate('WardrobeUpload')}
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F7E6D4',
    padding: 20,
    marginTop: 50,
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
    backgroundColor: '#A47551',
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  title: {
    fontSize: 28,
    color: '#5C6B73',
    marginBottom: 20,
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
  button: {
    backgroundColor: '#A47551',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 10,
    fontFamily: 'Avenir',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Avenir-Medium',
  },
});

export default UserLocation;