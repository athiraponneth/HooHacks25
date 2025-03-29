import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Button, TextInput, StyleSheet, Alert, Image } from 'react-native';
import { auth } from './firebaseConfig'; // Make sure you have firebase config
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import OutfitSearchScreen from './OutfitSearchScreen'; // Outfit search screen
import CreateAccountScreen from './CreateAccountScreen'; // Create account screen
import UserLocation from './components/UserLocation';
import logo from './assets/logo.png'; // Logo image
import WardrobeUpload from './WardrobeUpload';

// Sign In Screen Component
function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('UserLocation'); // Navigate to the outfit search screen
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
      <Button title="sign in" onPress={handleSignIn} color="#A47551" fontFamily="Avenir-Medium"/>
      <Button
        title="don't have an account? create one"
        onPress={() => navigation.replace('CreateAccount')}
        color="#6D4C41"
      />
    </View>
  );
}

// App component with navigation
export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="UserLocation" component={UserLocation} />
            <Stack.Screen name="OutfitSearchScreen" component={OutfitSearchScreen} />
            <Stack.Screen name="WardrobeUpload" component={WardrobeUpload} />
            <Stack.Screen name="SignInScreen" component={SignInScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
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
    backgroundColor: '#F7E6D4', // Warm cream background
    padding: 20,
    marginTop: 50,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    color: '#5C6B73', // Soft navy
    marginBottom: 20,
    fontWeight: '600',
    fontFamily: 'Avenir-Medium', // More playful font, fallbacks to system default if unavailable
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: '#A8DADC', // Soft blue
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 25, // More rounded corners for softer look
    paddingLeft: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#457B9D', // Deeper blue for text
    fontFamily: 'Avenir', // Matching font
  },
  button: {
    backgroundColor: '#E76F51', // Soft coral
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
  link: {
    color: '#2A9D8F', // Teal accent
    marginTop: 15,
    textAlign: 'center',
    fontSize: 16,
    textDecorationLine: 'underline',
    fontFamily: 'Avenir',
  },
});
