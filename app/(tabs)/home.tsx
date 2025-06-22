import React, { useEffect, useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from "@/components/ui/Text";
import { useLocation } from '../../hooks/useLocation';
import { LocationExpandedView } from '../../components/LocationExpandedView';
import { router, useLocalSearchParams } from 'expo-router';
import { fetchFeaturedProducts, fetchTopCategories, fetchProducts } from '../../lib/fetchProducts';
import { Product } from '../../types/productTypes';
import { Category } from '@/types/categoryTypes';
import ProductOfTheDay from '@/components/customComponents/home/ProdectOfTheDay';
import TopCategories from '../../components/customComponents/home/TopCategories';
import FeaturedProducts from '../../components/customComponents/home/FeaturedProducts';
import { Button } from '@/components/ui/Button';
import { isPincodeServiceable } from '@/lib/handleLocation';
import { useGlobalContext } from '../../context/GlobalProvider';
import { fetchUserDetails } from '../../lib/handleUser';
import { User } from '../../types/userTypes';
import NotificationBell from '../../components/NotificationBell';

const Home: React.FC = () => {
  const { location, address, loading, error, getLocation } = useLocation();
  const { user } = useGlobalContext() as { user: User | null };
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [topCategories, setTopCategories] = useState<Category[]>([]);
  const [isServiceable, setIsServiceable] = useState(true);
  const [checkedServiceability, setCheckedServiceability] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [userDetails, setUserDetails] = useState<User | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [products, categories] = await Promise.all([
        fetchFeaturedProducts(),
        fetchTopCategories(),
      ]);
      setFeaturedProducts(products);
      setTopCategories(categories);
    } catch (error) {
      setErrorMessage('Failed to fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user details for Ratana Cash
  useEffect(() => {
    const loadUserDetails = async () => {
      if (!user?.$id) return;
      try {
        const details = await fetchUserDetails(user.$id.toString());
        setUserDetails(details);
      } catch (error) {
        console.log("Error loading user details:", error);
      }
    };
    loadUserDetails();
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh both location and products
      await Promise.all([
        getLocation(),
        loadData()
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [getLocation]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const checkServiceability = async () => {
      if (!loading && address?.postalCode) {
        const pincode = address.postalCode;
        const serviceable = await isPincodeServiceable(pincode);
        setIsServiceable(serviceable);
        setCheckedServiceability(true);
      } else if (!loading) {
        setIsServiceable(false);
        setCheckedServiceability(true);
      }
    };
    checkServiceability();
  }, [address?.postalCode, loading]);

  // Fetch all products for search
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const products = await fetchProducts();
        setAllProducts(products);
      } catch (error) {
        // Ignore for now
      }
    };
    loadAllProducts();
  }, []);

  // Search logic
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearching(false);
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = allProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  }, [searchQuery, allProducts]);

  const filteredProducts = featuredProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text variant="body" children="Loading..." />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text variant="body" children={errorMessage} />
      </View>
    );
  }

  const LocationHeader = () => (
    <View className="flex-row items-center pt-4">
      <Ionicons name="location" size={24} color="white" />
      <View className="ml-2 flex-1">
        {loading ? (
          <>
            <Text className="text-white font-bold text-lg" children="Loading..." />
            <Text className="text-white text-sm" children="Getting your location" />
          </>
        ) : error ? (
          <>
            <Text className="text-white font-bold text-lg" children="Location Error" />
            <Text className="text-white text-sm" children={error} />
          </>
        ) : (
          <>
            <Text className="text-white font-bold text-lg" numberOfLines={1} children={address?.area || 'Select Location'} />
            <Text className="text-white text-sm" numberOfLines={1} children={address?.city || 'Set your delivery location'} />
          </>
        )}
      </View>
      {/* Ratana Cash Display */}
      <View className="bg-white/20 rounded-full px-3 py-1 mr-2">
        <Text className="text-white text-sm font-semibold">
          ₹{userDetails?.ratanaCash || 0}
        </Text>
        <Text className="text-white text-xs text-center">
          Ratana Cash
        </Text>
      </View>
      {/* Notification Bell */}
      <NotificationBell size={24} color="#ffffff" showBadge={true} />
      <TouchableOpacity 
        onPress={() => getLocation()}
        className="p-2 ml-2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="refresh" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  const handleViewAll = (type: string) => {
    router.push(`/view-all/${type}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Serviceability Warning - only at the top header */}
      {checkedServiceability && !isServiceable && (
        <View className="bg-red-100 p-3 flex-row items-center justify-center">
          <Ionicons name="alert-circle" size={20} color="#dc2626" />
          <Text className="text-red-700 ml-2" children="This app is not serviceable at your current address. Please update your location." />
        </View>
      )}

      {/* Header with Location */}
      <View className="bg-[#E86A2B] px-4 pb-4">
        <LocationHeader />
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-[#F7C873] rounded-full mt-4 px-4 py-2">
          <Ionicons name="search" size={20} color="#7C4A1E" />
          <TextInput
            placeholder="Search products..."
            className="flex-1 ml-2 text-[#7C4A1E]"
            placeholderTextColor="#7C4A1E]"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#7C4A1E" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E86A2B']}
            tintColor="#E86A2B"
          />
        }
      >
        {/* Search Results */}
        {searching && (
          <View className="px-4 py-4">
            <Text className="text-xl font-bold mb-2 text-[#E86A2B]">Search Results</Text>
            {searchResults.length === 0 ? (
              <Text className="text-[#7C4A1E]">No products found.</Text>
            ) : (
              searchResults.map(product => (
                <TouchableOpacity key={product.$id} onPress={() => router.push(`/product/${product.$id}`)} className="mb-4 bg-[#F7C873] rounded-lg p-4">
                  <Text className="font-bold text-lg text-[#E86A2B]">{product.name}</Text>
                  <Text className="text-[#7C4A1E]">{product.description}</Text>
                  <Text className="text-[#E86A2B] font-semibold">₹{product.price}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Default Home Sections */}
        {!searching && <ProductOfTheDay />}
        {!searching && topCategories.length > 0 && (
          <View className="px-4 bg-[#F7C873] rounded-2xl mt-4 pb-2">
            <View className="flex-row justify-between items-center mb-4 pt-4">
              <Text className="text-xl font-bold text-[#E86A2B]" children="Top Categories" />
              <Button
                onPress={() => handleViewAll('categories')}
                className="bg-transparent"
                children={<Text className="text-[#E86A2B]" children="View All" />}
              />
            </View>
            <TopCategories />
          </View>
        )}
        {!searching && featuredProducts.length > 0 && (
          <View className="px-4 mt-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold" children="Featured Products" />
              <Button
                onPress={() => handleViewAll('featured')}
                className="bg-transparent"
                children={<Text className="text-blue-500" children="View All" />}
              />
            </View>
            <FeaturedProducts />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;