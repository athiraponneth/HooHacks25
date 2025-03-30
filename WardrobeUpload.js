import React, { useState } from 'react';
import { Button, View, Alert, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AWS from 'aws-sdk/dist/aws-sdk-react-native'; // Import AWS SDK

// AWS configuration 
const AWS_ACCESS_KEY_ID = "AKIATE5EMQZENR2OLDOF";
const AWS_SECRET_ACCESS_KEY = "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";
const AWS_REGION = "us-east-1";
const AWS_S3_BUCKET = "hoohacks25";

const GOOGLE_CLOUD_API_KEY = "AIzaSyBWlsjXEeOMPSC1Kka9v3JyYUMQ9BPAibc";

// Initialize AWS S3 with your credentials
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const s3 = new AWS.S3();

const TOGETHER_API_KEY='fc64da8c593f8da107e5a6cbf3791925f81c87b66482dcdc90250752acc993a3'

export async function LLMOutput1(imageAnalysis) { 
    const prompt = `You are a fashion expert. Analyze the following image description and color values. 
    1. Convert the RGB values to their closest matching color names (e.g., burgundy, navy blue, forest green, beige, etc.)
    2. Format the output as a comma-separated list of items with their colors
    Image Analysis: ${imageAnalysis}`;;

    try {
        const response = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOGETHER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistralai/Mistral-7B-Instruct-v0.1',
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 100
            })
        });

        const data = await response.json();
        const clothingList = data.choices[0].message.content.trim();
        
        console.log('Image Analysis:', imageAnalysis);
        console.log('Extracted Clothing Items:', clothingList);
        
        return clothingList;
    } catch (error) {
        console.error('Error extracting clothing items:', error);
        return '';
    }
}

async function generateSearchQuery(imageAnalysis) { 
    const prompt = `Given a list of clothing items ${WardrobeUpload.LLMOutput1}, create a simple Pexels API friendly search query by focusing on the main item and it's color such as 
    "red hoodie". Clothing items: ${imageAnalysis}. Output only the search query`;
    
    try {
        const response = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOGETHER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistralai/Mistral-7B-Instruct-v0.1',
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.3, // Reduced for more focused outputs
                max_tokens: 20    // Reduced since we need a short query
            })
        });

        const data = await response.json();
        const searchQuery = data.choices[0].message.content.trim();
        
        console.log('Original Analysis:', imageAnalysis);
        console.log('Generated Search Query:', searchQuery);
        
        return searchQuery;
    } catch (error) {
        console.error('Error generating search query:', error);
        return '';
    }
}

const WardrobeUpload = ({ navigation }) => {
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
        const colors = data.responses[0].imagePropertiesAnnotation?.dominantColors?.colors || [];

        let description = 'Clothing items: ';
        
        // Collect some labels and describe the clothing and colors
        labels.forEach((label) => {
          description += `${label.description}, `;
        });
        
        if (colors.length > 0) {
          description += 'Colors: ';
          colors.forEach((color) => {
            const red = color.color.red;
            const green = color.color.green;
            const blue = color.color.blue;
            description += `Red(${red}), Green(${green}), Blue(${blue}); `;
          });
        }

        setImageDescription(description);
        
        // Process the description with Mistral-7B and navigate after logging
        const clothingItems = await LLMOutput1(description);
        console.log('Processed by Mistral-7B:', clothingItems);
        
        // Add navigation after logging
        navigation.navigate('OutfitSearchScreen');

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
      <Text style={styles.title}>Upload to Your Wardrobe</Text>
      <Text style={styles.subtitle}>Add clothing items to your digital wardrobe</Text>
      
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
          <Text style={styles.resultTitle}>Image Analysis:</Text>
          <Text style={styles.resultText}>{imageDescription}</Text>
          <Text style={styles.resultText}></Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Back to Search" 
          onPress={() => navigation.navigate('OutfitSearchScreen')} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#555',
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
    marginTop: 30,
    padding: 15,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 30,
    width: '100%',
  }
});

export default WardrobeUpload;