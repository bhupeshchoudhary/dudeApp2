import React, { useEffect, useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from "@/components/ui/Text";
import { useLocation } from '../../hooks/useLocation';
import { LocationExpandedView } from '../../components/LocationExpandedView';
import { router, useLocalSearchParams } from 'expo-router';
import { fetchFeaturedProducts, fetchTopCategories } from '../../lib/fetchProducts';
import { Product } from '../../types/productTypes';
import { Category } from '@/types/categoryTypes';
import ProductOfTheDay from '@/components/customComponents/home/ProdectOfTheDay';
import TopCategories from '../../components/customComponents/home/TopCategories';
import FeaturedProducts from '../../components/customComponents/home/FeaturedProducts';
import { Button } from '@/components/ui/Button';
import { isPincodeServiceable } from '@/lib/handleLocation';

const Home: React.FC = () => {
  const { location, address, loading, error, getLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [topCategories, setTopCategories] = useState<Category[]>([]);
  const [isServiceable, setIsServiceable] = useState(true);
  const [checkedServiceability, setCheckedServiceability] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
      <TouchableOpacity 
        onPress={() => getLocation()}
        className="p-2"
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
      <View className="bg-green-500 px-4 pb-4">
        <LocationHeader />
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-full mt-4 px-4 py-2">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            placeholder="Search products..."
            className="flex-1 ml-2"
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="mic" size={20} color="gray" />
          )
          }
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#22C55E']} // Green color to match your theme
            tintColor="#22C55E"
          />
        }
      >
        {/* Product of the Day */}
        <ProductOfTheDay />

        {/* Top Categories - Only show if we have categories */}
        {topCategories.length > 0 && (
          <View className="px-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold" children="Top Categories" />
              <Button
                onPress={() => handleViewAll('categories')}
                className="bg-transparent"
                children={<Text className="text-blue-500" children="View All" />}
              />
            </View>
            <TopCategories />
          </View>
        )}

        {/* Featured Products - Only show if we have products */}
        {featuredProducts.length > 0 && (
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