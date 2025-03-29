import React, { useState } from 'react';
import { Button, View, Alert, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET, GOOGLE_CLOUD_API_KEY } from 'react-native-dotenv';
import AWS from 'aws-sdk/dist/aws-sdk-react-native'; // Import AWS SDK
import * as FileSystem from 'expo-file-system';

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
  const [imageDescription, setImageDescription] = useState('');

  // Request permission to access the media library
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need permission to access your photos');
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

        // Define the upload parameters for S3
        const uploadParams = {
          Bucket: AWS_S3_BUCKET,
          Key: fileName,
          Body: picture,
          ContentType: imageMime,
        };

        setUploadStatus('Uploading to server...');
        console.log('Starting upload with params:', uploadParams);

        // Upload the image to S3
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

        // Call Google Vision API to analyze the uploaded image
        analyzeImageWithGoogleVision(s3Url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`Upload failed: ${error.message}`);
      Alert.alert('Upload Failed', `Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Function to analyze the image using Google Cloud Vision
  const analyzeImageWithGoogleVision = async (imageUrl) => {
    try {
      const apiEndpoint = 'https://vision.googleapis.com/v1/images:annotate';
      const apiKey = GOOGLE_CLOUD_API_KEY;

      const requestBody = {
        requests: [
          {
            image: {
              source: {
                imageUri: imageUrl,
              },
            },
            features: [
              {
                type: 'LABEL_DETECTION',
                maxResults: 5,
              },
              {
                type: 'IMAGE_PROPERTIES',
                maxResults: 5,
              },
            ],
          },
        ],
      };

      const response = await fetch(`${apiEndpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      console.log('Google Vision response:', data);


      if (data.responses && data.responses[0].error) {
        console.error('Google Vision API Error:', data.responses[0].error); // Log the specific error
      } else {
        console.log('Google Vision response data:', data);
      }

      if (data.responses && data.responses.length > 0) {
        const labels = data.responses[0].labelAnnotations || [];
        const colors = data.responses[0].imagePropertiesAnnotation.dominantColors.colors || [];

        let description = 'Clothing items: ';
        
        // Collect some labels and describe the clothing and colors
        labels.forEach((label) => {
          description += `${label.description}, `;
        });
        
        description += 'Colors: ';
        colors.forEach((color) => {
          // Retrieve the RGB values
          const red = color.color.red;
          const green = color.color.green;
          const blue = color.color.blue;
  
          // Add the RGB color description
          description += `Red(${red}), Green(${green}), Blue(${blue}); `;
        });

        setImageDescription(description);
      } else {
        setImageDescription('No relevant labels detected.');
      }
    } catch (error) {
      console.error('Google Vision analysis error:', error);
      Alert.alert('Analysis Failed', `Error: ${error.message}`);
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

      {imageDescription && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{imageDescription}</Text>
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
  },
  resultContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    color: 'green',
  }
});

export default App;
