import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

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
      navigation.navigate('GenerateAvatar'); // Navigate back to SignIn screen after account creation
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
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
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
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title="Create Account" onPress={handleCreateAccount} />
      <Text style={styles.link} onPress={() => navigation.navigate('SignIn')}>
        Already have an account? Sign In.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  link: {
    color: 'blue',
    marginTop: 10,
    textAlign: 'center',
  },
});