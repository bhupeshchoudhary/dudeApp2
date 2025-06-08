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
      <View className="py-4">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-4">
        <Text className="text-red-500" children={error} />
      </View>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-2"
    >
      {categories.map((category) => (
        <CategoryCard
          key={category.$id}
          title={category.name}
          image={{ uri: category.imageUrl }}
          onPress={() => router.push(`/category/${category.$id}`)}
        />
      ))}
    </ScrollView>
  );
};

export default TopCategories; 