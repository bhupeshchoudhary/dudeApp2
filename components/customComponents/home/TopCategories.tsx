import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/Text';
import { fetchTopCategories } from '../../../lib/fetchProducts';
import { Category } from '@/types/categoryTypes';
import { CategoryCard } from '@/components/customComponents/CategoryCard';
import { router } from 'expo-router';

const TopCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchTopCategories();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <View className="py-6 items-center">
        <ActivityIndicator size="large" color="#E86A2B" />
        <Text className="text-orange-600 mt-2" children="Loading categories..." />
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-4 items-center">
        <Text className="text-red-500 text-center" children={error} />
      </View>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <View className="py-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
        className="py-2"
      >
        {categories.map((category, index) => (
          <View key={category.$id} className="mr-4">
            <CategoryCard
              title={category.name}
              image={{ uri: category.imageUrl }}
              onPress={() => router.push(`/category/${category.$id}`)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default TopCategories; 