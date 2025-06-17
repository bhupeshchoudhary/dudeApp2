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
  ActivityIndicator
} from 'react-native';
import { Text } from '../../components/ui/Text';
import { fetchCategories } from '../../lib/fetchProducts';
import { Category } from '../../types/categoryTypes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 48 = padding (16*2) + gap (8*2)

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await fetchCategories();
      setCategories(result);
      setFilteredCategories(result);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadCategories();
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
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4 p-2 rounded-full bg-white/20"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
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
        <View className="flex-row items-center bg-white/90 rounded-full px-4 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-700"
            placeholder="Search categories..."
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

  const renderCategoryItem = (category: Category, index: number) => (
    <TouchableOpacity
      key={category.$id}
      className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden"
      style={{ width: ITEM_WIDTH }}
      onPress={() => router.push(`/category/${category.$id}`)}
      activeOpacity={0.8}
    >
      <View className="relative">
        <View className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 items-center justify-center">
          {category.imageUrl ? (
            <Image
              source={{ uri: category.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={['#f3f4f6', '#e5e7eb']}
              className="w-full h-full items-center justify-center"
            >
              <Ionicons name="grid" size={40} color="#9CA3AF" />
            </LinearGradient>
          )}
        </View>
        
        {/* Overlay gradient for better text readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          className="absolute bottom-0 left-0 right-0 h-16"
        />
        
        {/* Category name overlay */}
        <View className="absolute bottom-0 left-0 right-0 p-3">
          <Text 
            className="text-white font-semibold text-center text-sm"
            numberOfLines={2}
            style={{ textShadowColor: 'rgba(0,0,0,0.75)', textShadowRadius: 2 }}
          >
            {category.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-16">
      <Ionicons name="search" size={64} color="#D1D5DB" />
      <Text className="text-gray-500 text-lg font-medium mt-4 mb-2">
        No categories found
      </Text>
      <Text className="text-gray-400 text-center px-8">
        {searchQuery ? 
          `No categories match "${searchQuery}"` : 
          'Categories will appear here once loaded'
        }
      </Text>
      {searchQuery && (
        <TouchableOpacity
          onPress={() => setSearchQuery('')}
          className="mt-4 bg-[#E86A2B] px-6 py-2 rounded-full"
        >
          <Text className="text-white font-medium">Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator size="large" color="#667eea" />
      <Text className="text-gray-500 text-lg font-medium mt-4">
        Loading categories...
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {renderHeader()}
      
      {loading ? (
        renderLoadingState()
      ) : (
        <ScrollView 
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#E86A2B']}
              tintColor="#E86A2B"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredCategories.length === 0 ? (
            renderEmptyState()
          ) : (
            <View className="p-4">
              {/* Categories Grid */}
              <View className="flex-row flex-wrap justify-between">
                {filteredCategories.map((category, index) => 
                  renderCategoryItem(category, index)
                )}
              </View>
              
              {/* Bottom padding for better scrolling */}
              <View className="h-4" />
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}