import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

export default function GenerateAvatarScreen() {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateAvatar();
  }, []);

  const generateAvatar = async () => {
    try {
      const userId = Math.random().toString(36).substring(7);
      const url = `https://readyplayer.me/avatar?user=${userId}`;
      setAvatarUrl(url);
    } catch (error) {
      console.error('Error generating avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationStateChange = (navState) => {
    // Log the URL with fragments (if present)
    console.log('New URL:', navState.url);
    setAvatarUrl(navState.url);  // Optionally update avatarUrl with the new URL
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: avatarUrl }}
            style={styles.webview}
            onNavigationStateChange={handleNavigationStateChange}  // Handle URL changes
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  webviewContainer: {
    width: width * 0.9,
    height: height * 0.9,
    borderRadius: 10,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
});
