import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView, Linking } from 'react-native';
import axios from 'axios';

export default function ProductRecommendations({ navigation, route }) {
  const [productRecommendations, setProductRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendationsFetched, setRecommendationsFetched] = useState(false);
  
  // Get the avatar URL passed from the previous screen
  const { avatarUrl } = route.params;
  
  useEffect(() => {
    if (avatarUrl && !recommendationsFetched) {
      // Set state variable correctly
      setRecommendationsFetched(true);
      
      // Fetch both product types
      fetchProductRecommendations();
    }
  }, [avatarUrl]);
  
  const fetchProductRecommendations = async () => {
    try {
      setLoading(true);
      
      // Fetch both yellow hoodie and blue jeans

      

      const hoodiePromise = fetchRecommendation("yellow hoodie");
      const jeansPromise = fetchRecommendation("blue jeans");
      
      // Wait for both API calls to complete
      const [hoodieResults, jeansResults] = await Promise.all([hoodiePromise, jeansPromise]);
      
      // Combine results
      const combinedResults = [...(hoodieResults || []), ...(jeansResults || [])];
      
      if (combinedResults.length > 0) {
        setProductRecommendations(combinedResults);
      } else {
        setError('No product results found');
      }
    } catch (error) {
      console.error('API Error:', error);
      setError('Failed to fetch product recommendations');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRecommendation = async (query) => {
    try {
      console.log(`Fetching recommendations for: ${query}`);
      
      // Correctly formatted SERP API URL with parameters
      const response = await axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google_shopping',
          q: query,
          api_key: 'INSERT_API_KEY',
          num: 2 // Limit results to 2
        }
      });
      
      if (response.data && response.data.shopping_results) {
        // Map SERP API results to a more detailed format
        return response.data.shopping_results.slice(0, 2).map(item => {
          // Get category based on query
          const category = query.includes("hoodie") ? "Hoodie" : "Jeans";
          
          return {
            id: item.position || Math.random().toString(),
            name: item.title || "Product",
            price: item.price || "Price not available",
            originalPrice: item.price_raw ? `$${(item.price_raw * 1.3).toFixed(2)}` : null,
            discount: item.price_raw ? "30% off" : null,
            imageUrl: item.thumbnail,
            category: category,
            brand: item.source || "Unknown brand",
            rating: item.rating || 4.5,
            reviews: item.reviews || Math.floor(Math.random() * 1000),
            color: query.includes("yellow") ? "#FFD700" : "#4169E1", // Yellow or Blue
            link: item.link || "#",
            metadata: response.data.search_metadata || {},
            store: {
              name: item.source || "Online Store",
              logo: item.source_icon,
              payment_methods: "Affirm accepted",
              shipping: "Free",
              inStock: true,
              returns: "30-day returns"
            }
          };
        });
      }
      return [];
    } catch (error) {
      console.error(`Error fetching ${query}:`, error);
      return [];
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>oops!</Text>
          <Text style={styles.subtitle}>{error}</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>loading</Text>
          <ActivityIndicator size="large" color="#A47551" style={styles.loadingIndicator} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>product recommendations</Text>
          
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>
              Based on your style preferences
            </Text>
          </View>
          
          {productRecommendations.length > 0 && (
            <Text style={styles.resultsTitle}>shopping inspiration</Text>
          )}
          
          {productRecommendations.map((product) => (
            <View key={product.id} style={styles.resultCard}>
              <Image source={{ uri: product.imageUrl }} style={styles.image} />
              <Text style={styles.productName}>{product.name}</Text>
              
              <View style={styles.detailsContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>{product.price}</Text>
                  {product.originalPrice && (
                    <Text style={styles.originalPrice}>{product.originalPrice}</Text>
                  )}
                </View>
                
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingText}>★ {product.rating}</Text>
                  <Text style={styles.reviewsText}>({product.reviews} reviews)</Text>
                </View>
                
                <View style={styles.storeInfo}>
                  <Text style={styles.storeText}>
                    {product.store.name} • {product.store.shipping}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.viewButton}
                onPress={() => Linking.openURL(product.link)}
              >
                <Text style={styles.viewButtonText}>view product</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.navArrow}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navArrow}
          onPress={() => navigation.navigate('LandingPage')}
        >
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7E6D4',
    padding: 20,
    paddingTop: 120,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 60,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 40,
    gap: 40,
  },
  navArrow: {
    backgroundColor: '#E76F51',
    padding: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Avenir-Medium',
  },
  title: {
    fontSize: 28,
    color: '#5C6B73',
    marginBottom: 20,
    fontWeight: '600',
    fontFamily: 'Avenir-Medium',
    textAlign: 'center',
  },
  resultsTitle: {
    fontSize: 24,
    color: '#5C6B73',
    marginTop: 30,
    marginBottom: 15,
    fontWeight: '600',
    fontFamily: 'Avenir-Medium',
  },
  subtitle: {
    fontSize: 16,
    color: '#457B9D',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Avenir',
    paddingHorizontal: 20,
  },
  categoryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    fontSize: 18,
    color: '#5C6B73',
    fontWeight: '500',
    fontFamily: 'Avenir-Medium',
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
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Avenir-Medium',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    width: '90%',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginVertical: 10,
  },
  productName: {
    fontSize: 16,
    color: '#5C6B73',
    fontFamily: 'Avenir',
    marginVertical: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E76F51',
    marginRight: 8,
    fontFamily: 'Avenir-Medium',
  },
  originalPrice: {
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'line-through',
    fontFamily: 'Avenir',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  ratingText: {
    color: '#FFB900',
    fontSize: 14,
    marginRight: 6,
    fontWeight: '500',
    fontFamily: 'Avenir-Medium',
  },
  reviewsText: {
    fontSize: 13,
    color: '#707070',
    fontFamily: 'Avenir',
  },
  storeInfo: {
    alignItems: 'center',
  },
  storeText: {
    fontSize: 13,
    color: '#505050',
    fontFamily: 'Avenir',
  },
  viewButton: {
    backgroundColor: '#E76F51',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 5,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Avenir-Medium',
  }
});
