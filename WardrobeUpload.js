import React, { useState, useEffect } from 'react';
import { Button, View, Alert, Text, StyleSheet, ActivityIndicator, FlatList, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import { auth } from './firebaseConfig';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install this with: expo install @expo/vector-icons

// AWS configuration
const AWS_ACCESS_KEY_ID = "AKIATE5EMQZENR2OLDOF";
const AWS_SECRET_ACCESS_KEY = "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";
const AWS_REGION = "us-east-1";
const AWS_S3_BUCKET = "hoohacks25";

const GOOGLE_CLOUD_API_KEY = "AIzaSyBWlsjXEeOMPSC1Kka9v3JyYUMQ9BPAibc";

// Initialize AWS S3
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const s3 = new AWS.S3();

const TOGETHER_API_KEY='fc64da8c593f8da107e5a6cbf3791925f81c87b66482dcdc90250752acc993a3'

export async function LLMOutput1(imageAnalysis) { 

    const prompt = imageAnalysis + 'Analyze the provided list of image labels, return the label that is a clothing type (e.g., shirt, pants, dress). Respond with one word (no more) which must be a clothing item, not a color. Output should be just one word.';

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

const WardrobeUpload = ({ navigation }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [imageDescription, setImageDescription] = useState('');
  const [imageRed, setImageRed] = useState('');
  const [imageBlue, setImageBlue] = useState('');
  const [imageGreen, setImageGreen] = useState('');
  const [imgColor, setImageColor] = useState('');
  const [llmDec, setLLMDec] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userImages, setUserImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getCurrentUser = () => {
      const user = auth.currentUser;
      if (user) {
        // Remove special characters from email to make it safe for folder names
        const safeEmail = user.email.replace(/[^a-zA-Z0-9]/g, '_');
        setUserEmail(safeEmail);
        fetchUserImages(safeEmail); // Fetch images when user is loaded
      } else {
        // If no user is logged in, redirect to sign in
        Alert.alert('Please sign in', 'You need to be signed in to upload images');
        navigation.navigate('SignIn');
      }
    };
    
    getCurrentUser();
  }, []);

  const fetchUserImages = async (email) => {
    try {
      setIsLoading(true);
      
      // List objects in user's folder
      const params = {
        Bucket: AWS_S3_BUCKET,
        Prefix: `${email}/`
      };
      
      const response = await s3.listObjects(params).promise();
      
      if (response.Contents) {
        const imageList = response.Contents.map(item => {
          return {
            key: item.Key,
            url: `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${item.Key}`,
            date: item.LastModified
          };
        });
        
        // Sort images by date (newest first)
        imageList.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setUserImages(imageList);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      Alert.alert('Error', 'Failed to load your images');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete an image from S3
  const deleteImage = async (key) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const params = {
                Bucket: AWS_S3_BUCKET,
                Key: key
              };
              
              await s3.deleteObject(params).promise();
              
              // Update the list by removing the deleted image
              setUserImages(prevImages => 
                prevImages.filter(image => image.key !== key)
              );
              
              Alert.alert('Success', 'Image deleted successfully');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete the image');
            }
          }
        }
      ]
    );
  };
  const pickImage = async () => {
    try {
      // ✅ Request both camera and media library permissions
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
          Alert.alert('Permission Required', 'We need access to your photo library.');
          return;
      }
        
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert('Permission Required', 'Camera and gallery access is needed.');
        return;
      }
  
      Alert.alert(
        'Upload Image',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
                const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false,
                    quality: 1,
                    cameraType: ImagePicker.CameraType.back,
                    exif: false, // Try toggling this
                    videoMaxDuration: 10, // Add even when not using video
                  });
              console.log('Camera result:', result); // Debugging
  
              if (!result.canceled && result.assets?.length > 0) {
                uploadImage(result.assets[0].uri);
              }
            },
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 1,
              });
  
              if (!result.canceled && result.assets?.length > 0) {
                uploadImage(result.assets[0].uri);
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Image picking error:', error);
    }
  };
  
  const uploadImage = async (imageUri) => {
    try {
      setIsUploading(true);
      setUploadStatus('Preparing image...');
  
      const imageExt = imageUri.split('.').pop();
      const imageMime = `image/${imageExt}`;
  
      let picture = await fetch(imageUri);
      picture = await picture.blob();
  
      const fileName = `${userEmail}/${Date.now()}.${imageExt}`;
  
      const uploadParams = {
        Bucket: AWS_S3_BUCKET,
        Key: fileName,
        Body: picture,
        ContentType: imageMime,
      };
  
      setUploadStatus('Uploading to server...');
      console.log('Starting upload with params:', uploadParams);
  
      const uploadResponse = await s3.upload(uploadParams).promise();
      console.log('Upload successful', uploadResponse);
  
      setUploadStatus('Upload complete!');
      const s3Url = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
  
      Alert.alert('Upload Successful', 'Your image has been uploaded successfully!');
  
      analyzeImageWithGoogleVision(s3Url);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`Upload failed: ${error.message}`);
      Alert.alert('Upload Failed', `Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  async function getColorName(r, g, b) {

    console.log("red" + r)
    try {
        const response = await fetch(`https://www.thecolorapi.com/id?rgb=${r},${g},${b}&format=json`);
        console.log(`https://www.thecolorapi.com/id?rgb=${r},${g},${b}`)
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        // Try parsing it as JSON
        const data = JSON.parse(responseText);
        
        if (data.name && data.name.value) {
            return data.name.value;
        } else {
            console.error('Unexpected API response:', data);
            return 'Unknown Color';
        }
    } catch (error) {
        console.error('Error fetching color name:', error);
        return 'Unknown Color';
    }
}


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

        setImageDescription(description);

        let colorName = ""; 

        totalRed = 0
        totalGreen = 0
        totalBlue = 0

        if (colors.length > 0) {
                
            colors.forEach((color) => {
              const red = color.color.red;
              const green = color.color.green;
              const blue = color.color.blue;
              
              totalRed += red;
              totalGreen += green;
              totalBlue += blue;
            });
    
            const avgRed = Math.round(totalRed / colors.length);
            const avgGreen = Math.round(totalGreen / colors.length);
            const avgBlue = Math.round(totalBlue / colors.length);
    
            const averagedColor = `${avgRed}, ${avgGreen}, ${avgBlue}`;

            setImageRed(avgRed);
            setImageGreen(avgGreen);
            setImageBlue(avgBlue);

            console.log('Averaged Color:', averagedColor);

            colorName = await getColorName(avgRed, avgGreen, avgBlue);
            console.log('Color Name:', colorName);

          }
          


        
        // Process the description with Mistral-7B and navigate after logging
        const clothingItems = await LLMOutput1(description);
        console.log('Processed by Mistral-7B:', clothingItems);



        if (clothingItems && colorName) {
            navigation.navigate('OutfitSearchScreen', {
                clothingItem: clothingItems,
                clothingColor: colorName,
            });
        } else {
            console.error("Navigation aborted: Empty clothing item or color");
        }
          

      } else {
        setImageDescription('No relevant labels detected.');
      }
    } catch (error) {
      console.error('Google Vision analysis error:', error);
      Alert.alert('Analysis Failed', `Error: ${error.message}`);
    }
  };

  // Function to render an individual image item
  const renderImageItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.url }} style={styles.thumbnail} />
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteImage(item.key)}
      >
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

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
      
      {/* User's previous images section */}
      <View style={styles.imagesSection}>
        <Text style={styles.sectionTitle}>Your Wardrobe Items</Text>
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : userImages.length > 0 ? (
          <FlatList
            data={userImages}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.key}
            numColumns={2}
            contentContainerStyle={styles.imageList}
          />
        ) : (
          <Text style={styles.noImagesText}>No images in your wardrobe yet</Text>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Back to Search" 
          onPress={() => navigation.navigate('OutfitSearchScreen')} 
        />
        {userImages.length > 0 && (
          <Button 
            title="Refresh Images" 
            onPress={() => fetchUserImages(userEmail)} 
            color="#4CAF50"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  imagesSection: {
    marginTop: 30,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  imageList: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: '48%',
    margin: '1%',
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 5,
    zIndex: 1,
  },
  noImagesText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  }
});

export default WardrobeUpload;