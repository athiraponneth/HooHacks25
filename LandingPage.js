import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import logo from './assets/logo.png';
import user from './assets/user.png';
import red from './assets/red.png';
import GenerateAvatarScreen from './GenerateAvatarScreen';
import UserLocation from './components/UserLocation';
import Profile from './Profile';
import SignInScreen from './SignInScreen'; 

export default function LandingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      
      {/* Red icon at the top left corner */}
      <TouchableOpacity 
        style={styles.redIconContainer} 
        onPress={() => navigation.navigate('SignInScreen') } // Navigate to SignIn screen
      >
        <Image source={red} style={styles.redIcon} />
      </TouchableOpacity>

      {/* User icon at the top right corner */}
      <TouchableOpacity 
        style={styles.userIconContainer} 
        onPress={() => navigation.navigate('Profile') }>
        <Image source={user} style={styles.userIcon} />
      </TouchableOpacity>

      <View style={styles.container}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>don't stress it, just <Text style={styles.bold}>wearit </Text> :)</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('GenerateAvatarScreen')}>
          <Text style={styles.buttonText}>virtual fitting room</Text>
        </TouchableOpacity>
        <View style={styles.spacing} />
        <View style={styles.spacing} />
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('WardrobeUpload')}>
          <Text style={styles.buttonText}>customize my wardrobe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7E6D4',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: '#5C6B73',
    marginBottom: 30,
    fontWeight: '600',
    textAlign: 'center',
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
    marginTop: 15,
    alignItems: 'center',
    width: '80%',
  },
  userIconContainer: {
    position: 'absolute',
    top: 40, 
    right: 20,
  },
  userIcon: {
    width: 40, 
    height: 40, 
    borderRadius: 20, 
  },
  redIconContainer: {
    position: 'absolute',
    top: 40,  // Adjust as needed for exact placement
    left: 20,
    width: 20
  },
  redIcon: {
    width: 40, 
    height: 40,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});