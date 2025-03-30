import React, { useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

export default function GenerateAvatarScreen({ navigation }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const avatarGeneratorUrl = "https://readyplayer.me/avatar?frameApi"; // Enable API mode

  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      // Check if the message is an avatar export event (user clicked "Next")
      if (message.source === "readyplayerme" && message.eventName === "v1.avatar.exported") {
        const finalAvatarUrl = message.data.url;
        setAvatarUrl(finalAvatarUrl);
        console.log("Avatar finalized:", finalAvatarUrl);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: avatarGeneratorUrl }}
            style={styles.webview}
            injectedJavaScript={`
              window.addEventListener("message", (event) => {
                if (event.data?.source === "readyplayerme") {
                  window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
                }
              });

              // Subscribe to avatar export event (detect when user clicks "Next")
              window.postMessage(JSON.stringify({ target: "readyplayerme", type: "subscribe", eventName: "v1.avatar.exported" }), "*");
            `}
            onMessage={handleMessage}
          />
        </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('LandingPage')}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>

      {/* Show "Continue" button only when the avatar is finalized */}
      {avatarUrl && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('ProductRecommendations', { avatarUrl })}>
          <Text style={styles.buttonText}>Continue to Product Recommendations</Text>
        </TouchableOpacity>
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
    height: height * 0.8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
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
    marginBottom: 10,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});