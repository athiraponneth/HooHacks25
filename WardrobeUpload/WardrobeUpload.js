import React, { useState } from 'react';
import { Button, View, Alert, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET } from 'react-native-dotenv';
import * as ImagePicker from 'expo-image-picker';
import AWS from 'aws-sdk/dist/aws-sdk-react-native'; // Import AWS SDK

// Initialize AWS S3 with your credentials
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const s3 = new AWS.S3();

const App = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Request permission to access the media library
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Need permission to access your photos');
        return;
      }

      // Launch the image picker - use the original MediaTypeOptions to be compatible
      const result = await ImagePicker.launchImageLibraryAsync({
        // Just use 'All' to avoid any compatibility issues
        allowsEditing: false,
        quality: 1,
      });

      console.log('Image picker result:', JSON.stringify(result));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imagePath = result.assets[0].uri;
        const imageExt = imagePath.split('.').pop();
        const imageMime = `image/${imageExt}`;

        setIsUploading(true);
        setUploadStatus('Preparing image...');

        // Fetch the image and convert it to a blob
        let picture = await fetch(imagePath);
        picture = await picture.blob();

        // Create a unique key for the image in the S3 bucket
        const fileName = `uploads/${Date.now()}.${imageExt}`;

        // Upload to S3 - removed the ACL property
        const uploadParams = {
          Bucket: AWS_S3_BUCKET,
          Key: fileName,
          Body: picture,
          ContentType: imageMime,
        };

        setUploadStatus('Uploading to server...');
        
        console.log('Starting upload with params:', {
          Bucket: AWS_S3_BUCKET,
          Key: fileName,
          ContentType: imageMime
        });
        
        const uploadResponse = await s3.upload(uploadParams).promise();

        console.log('Upload successful', uploadResponse);
        setUploadStatus('Upload complete!');
        
        // Create the S3 URL for the uploaded file
        const s3Url = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
        
        Alert.alert(
          'Upload Successful', 
          'Your image has been uploaded successfully!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`Upload failed: ${error.message}`);
      Alert.alert('Upload Failed', `Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button 
        title="Pick and Upload Image" 
        onPress={pickImage} 
        disabled={isUploading} 
      />
      
      {isUploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.uploadingText}>{uploadStatus}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 10,
    fontSize: 16,
  }
});

export default App;