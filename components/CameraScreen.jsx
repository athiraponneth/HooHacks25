import { Camera } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { View, Button, Text, Alert } from 'react-native';

const CameraScreen = ({ onPhotoCaptured }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      console.log('Photo taken:', photo);
      onPhotoCaptured(photo.uri); // Pass captured photo URI to parent
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera ref={cameraRef} style={{ flex: 1 }} type={Camera.Constants.Type.back} />
      <Button title="Take Picture" onPress={takePicture} />
    </View>
  );
};
