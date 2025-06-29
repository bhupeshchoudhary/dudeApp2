// app/(tabs)/categories.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity, 
  Image, 
  TextInput,
  Dimensions,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Text } from '../../components/ui/Text';
import { fetchCategories, fetchProductsByCategoryId } from '../../lib/fetchProducts';
import { Category } from '../../types/categoryTypes';
import { Product } from '../../types/productTypes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface CategoryWithProducts {
  category: Category;
  products: Product[];
}

export default function CategoriesScreen() {
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<CategoryWithProducts[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<CategoryWithProducts[]>([]);
  const router = useRouter();

  const loadCategoriesWithProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First fetch all categories
      const categories = await fetchCategories();
      
      // Then fetch products for each category (limit to first 8 products per category)
      const categoriesWithProducts = await Promise.all(
        categories.map(async (category) => {
          try {
            const products = await fetchProductsByCategoryId(category.$id);
            return {
              category,
              products: products.slice(0, 8) // Show only first 8 products
            };
          } catch (error) {
            console.error(`Error fetching products for category ${category.name}:`, error);
            return {
              category,
              products: []
            };
          }
        })
      );

      // Filter out categories with no products
      const validCategories = categoriesWithProducts.filter(item => item.products.length > 0);
      
      setCategoriesWithProducts(validCategories);
      setFilteredCategories(validCategories);
      console.log(`Loaded ${validCategories.length} categories with products`);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoriesWithProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(categoriesWithProducts);
    } else {
      const filtered = categoriesWithProducts.filter(item =>
        item.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.products.some(product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categoriesWithProducts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadCategoriesWithProducts();
    } catch (error) {
      console.error('Error refreshing categories:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderHeader = () => (
    <View className="bg-white">
      <LinearGradient
        colors={["#F7C873", "#EBA05C", "#E86A2B", "#7C4A1E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="px-4 py-6 pt-6"
      >
        <View className="flex-row items-center mb-4">
          <Text className="text-2xl font-bold text-white flex-1">
            Categories
          </Text>
          <View className="bg-white/20 px-3 py-1 rounded-full">
            <Text className="text-white text-sm font-medium">
              {filteredCategories.length}
            </Text>
          </View>
        </View>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-white/90 rounded-full px-4 py-1">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-700"
            placeholder="Search categories or products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  const renderProductItem = (product: Product, index: number) => {
    const backgroundColors = [
      '#FFE4E1', // Light pink
      '#E6F3FF', // Light blue  
      '#F0E6FF', // Light purple
      '#E6FFE6', // Light green
      '#FFF0E6', // Light orange
      '#FFE6F0', // Light rose
    ];

    return (
      <TouchableOpacity
        key={product.$id}
        className="items-center mb-4"
        style={{ width: '23%' }}
        onPress={() => router.push(`/product/${product.$id}`)}
        activeOpacity={0.8}
      >
        <View 
          className="w-16 h-16 rounded-full items-center justify-center mb-2"
          style={{ backgroundColor: backgroundColors[index % backgroundColors.length] }}
        >
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              className="w-12 h-12 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="cube" size={24} color="#666" />
          )}
        </View>
        <Text 
          className="text-xs text-center text-gray-700 font-medium"
          numberOfLines={2}
          style={{ lineHeight: 14 }}
        >
          {product.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCategorySection = (item: CategoryWithProducts) => (
    <View key={item.category.$id} className="mb-6">
      {/* Category Header */}
      <View className="flex-row items-center justify-between px-4 mb-3">
        <Text className="text-lg font-bold text-gray-800">
          {item.category.name}
        </Text>
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={() => router.push(`/category/${item.category.$id}`)}
        >
          <Ionicons name="arrow-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <View className="px-4">
        <View className="flex-row flex-wrap justify-between">
          {item.products.map((product, index) => 
            renderProductItem(product, index)
          )}
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-16">
      <Ionicons name="search" size={64} color="#D1D5DB" />
      <Text className="text-gray-500 text-lg font-medium mt-4 mb-2">
        {error ? 'Failed to load categories' : 'No categories found'}
      </Text>
      <Text className="text-gray-400 text-center px-8">
        {error ? 
          'Please check your connection and try again' :
          searchQuery ? 
            `No categories match "${searchQuery}"` : 
            'Categories will appear here once loaded'
        }
      </Text>
      {error && (
        <TouchableOpacity
          onPress={loadCategoriesWithProducts}
          className="mt-4 bg-[#E86A2B] px-6 py-3 rounded-full"
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      )}
      {searchQuery && !error && (
        <TouchableOpacity
          onPress={() => setSearchQuery('')}
          className="mt-4 bg-[#E86A2B] px-6 py-3 rounded-full"
        >
          <Text className="text-white font-medium">Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator size="large" color="#E86A2B" />
      <Text className="text-gray-500 text-lg font-medium mt-4">
        Loading categories...
      </Text>
      <Text className="text-gray-400 text-sm mt-2">
        Please wait while we fetch all categories and products
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {renderHeader()}
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {renderHeader()}
      
      {error || filteredCategories.length === 0 ? (
        renderEmptyState()
      ) : (
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
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          {filteredCategories.map(item => renderCategorySection(item))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}