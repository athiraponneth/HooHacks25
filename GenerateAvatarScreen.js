import React, { useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

export default function GenerateAvatarScreen({ navigation }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarId, setAvatarId] = useState(null); // Move useState inside the component
  const [loading, setLoading] = useState(true);

  const avatarGeneratorUrl = "https://readyplayer.me/avatar?frameApi"; // Enable API mode

  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      // Check if the message is an avatar export event (user clicked "Next")
      if (message.source === "readyplayerme" && message.eventName === "v1.avatar.exported") {
        const avatarId = message.data.avatarId;  // Assuming the ID is included in the message data

        // Generate the avatar URL based on the ID
        const generatedAvatarUrl = `https://models.readyplayer.me/${avatarId}.png?size=512&expression=happy&pose=relaxed&camera=fullbody&background=255%2C255%2C255&quality=90`;

        setAvatarUrl(generatedAvatarUrl); // Set the generated URL
        setAvatarId(avatarId); // Set the avatar ID
        console.log("Avatar finalized:", generatedAvatarUrl, "Avatar ID:", avatarId);
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
        <Text style={styles.buttonText}>back to home</Text>
      </TouchableOpacity>

      {/* Show "Continue" button only when the avatar is finalized */}
      {avatarUrl && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('ProductRecommendations', { avatarUrl })}>
          <Text style={styles.buttonText}>continue to product recommendations</Text>
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
    backgroundColor: '#F7E6D4',
  },
  webviewContainer: {
    width: width * 0.9,
    height: height * 0.7,
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
    marginTop: 10,
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
