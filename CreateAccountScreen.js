import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import logo from './assets/logo.png';

export default function CreateAccountScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCreateAccount = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Account Created', `Welcome ${userCredential.user.email}`);
      navigation.navigate('GenerateAvatarScreen');
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-email':
          Alert.alert('Error', 'The email address is badly formatted.');
          break;
        case 'auth/email-already-in-use':
          Alert.alert('Error', 'This email address is already in use.');
          break;
        case 'auth/weak-password':
          Alert.alert('Error', 'The password is too weak. Use at least 6 characters.');
          break;
        default:
          Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>welcome!</Text>
      <TextInput
        style={styles.input}
        placeholder="email"
        placeholderTextColor="#7A6F60"
        keyboardType="email-address"
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
      <TextInput
        style={styles.input}
        placeholder="confirm password"
        placeholderTextColor="#7A6F60"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
        <Text style={styles.buttonText}>create account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.link}>already have an account? sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F7E6D4',
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