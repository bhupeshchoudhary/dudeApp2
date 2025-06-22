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
import { fetchCategories } from '../../lib/fetchProducts';
import { Category } from '../../types/categoryTypes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 48 = padding (16*2) + gap (16)

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchCategories();
      setCategories(result);
      setFilteredCategories(result);
      console.log(`Loaded ${result.length} categories`);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again.');
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
        <View className="flex-row items-center bg-white/90 rounded-full px-4 py-3">
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

  const renderCategoryItem = ({ item: category, index }: { item: Category; index: number }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden"
      style={{ width: '48%' }}
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
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          className="absolute bottom-0 left-0 right-0 h-20"
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
          onPress={loadCategories}
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
        Please wait while we fetch all categories
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {renderHeader()}
      
      {loading ? (
        renderLoadingState()
      ) : (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.$id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#E86A2B']}
              tintColor="#E86A2B"
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
}