import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Button, TextInput, StyleSheet, Alert } from 'react-native';
import { auth } from './firebaseConfig'; // Make sure you have firebase config
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import OutfitSearchScreen from './OutfitSearchScreen'; // Outfit search screen
import CreateAccountScreen from './CreateAccountScreen'; // Create account screen
import UserLocation from './components/UserLocation';
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
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign In" onPress={handleSignIn} />
      <Button
        title="Don't have an account? Create one"
        onPress={() => navigation.replace('CreateAccount')}
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
      <Stack.Navigator>
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
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 10,
  },
});
