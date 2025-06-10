// app/(tabs)/categories.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { Text } from '../../components/ui/Text';
import { fetchCategories } from '../../lib/fetchProducts';
import { Category } from '../../types/categoryTypes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadCategories = async () => {
    try {
      const result = await fetchCategories();
      setCategories(result);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

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
    <View className="p-4 mt-10 border-b border-gray-200 shadow-sm">
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold ml-4" children="Categories" />
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {renderHeader()}
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#22C55E']}
            tintColor="#22C55E"
          />
        }
      >
        <View className="p-4">
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.$id}
                className="w-[48%] bg-white p-4 rounded-lg shadow-sm mb-4"
                onPress={() => router.push(`/category/${category.$id}`)}
              >
                <View className="aspect-square bg-gray-100 rounded-lg mb-2 items-center justify-center overflow-hidden">
                  {category.imageUrl ? (
                    <Image
                      source={{ uri: category.imageUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="grid" size={32} color="#9CA3AF" />
                  )}
                </View>
                <Text className="text-center font-medium" numberOfLines={2}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}