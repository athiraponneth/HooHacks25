import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TextInput, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import OutfitSearchScreen from './OutfitSearchScreen';
import CreateAccountScreen from './CreateAccountScreen';
import GenerateAvatarScreen from './GenerateAvatarScreen';
import UserLocation from './components/UserLocation';
import WardrobeUpload from './WardrobeUpload';
import LandingPage from './LandingPage';
import logo from './assets/logo.png';
import user from './assets/user.png';
import Profile from './Profile';
import Weather from './components/Weather'
import ProductRecommendations from './ProductRecommendations'

// Sign In Screen Component
function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('LandingPage');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>welcome back!</Text>
      <TextInput
        style={styles.input}
        placeholder="email"
        placeholderTextColor="#7A6F60"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="password"
        placeholderTextColor="#7A6F60"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>sign in</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.replace('CreateAccount')}>
        <Text style={styles.link}>don't have an account? create one</Text>
      </TouchableOpacity>
    </View>
  );
}

// App Component
export default function App() {
  const [user, setUser] = useState(null);
  const Stack = createStackNavigator();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="SignInScreen" component={SignInScreen} />
            <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
            <Stack.Screen name="LandingPage" component={LandingPage} />
            <Stack.Screen name="UserLocation" component={UserLocation} />
          </>
        ) : (
          <>
            <Stack.Screen name="LandingPage" component={LandingPage} />
            <Stack.Screen name="GenerateAvatarScreen" component={GenerateAvatarScreen} />
            <Stack.Screen name="WardrobeUpload" component={WardrobeUpload} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="SignInScreen" component={SignInScreen} />
            <Stack.Screen name="OutfitSearchScreen" component={OutfitSearchScreen} />
            <Stack.Screen name="ProductRecommendations" component={ProductRecommendations} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F7E6D4',
    padding: 20,
    paddingTop: 50,
    alignContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    color: '#5C6B73',
    marginBottom: 20,
    fontWeight: '600',
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: '#A8DADC',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 25,
    paddingLeft: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#457B9D',
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
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 15,
  },
  link: {
    color: '#2A9D8F',
    fontSize: 16,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});