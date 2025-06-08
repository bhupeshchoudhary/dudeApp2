import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { fetchFeaturedProducts, fetchTopCategories } from '@/lib/fetchProducts';
import { Product } from '@/types/productTypes';
import { Category } from '@/types/categoryTypes';
import ProductCard from '@/components/customComponents/ProductCard';
import { CategoryCard } from '@/components/customComponents/CategoryCard';

const ViewAllScreen = () => {
  const { type } = useLocalSearchParams();
  const [items, setItems] = useState<Product[] | Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        let data;
        if (type === 'featured') {
          data = await fetchFeaturedProducts();
        } else if (type === 'categories') {
          data = await fetchTopCategories();
        } else {
          throw new Error('Invalid type');
        }
        setItems(data);
      } catch (error) {
        console.error('Error loading items:', error);
        setError('Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [type]);

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center" children={error} />
        <Button
          onPress={() => router.back()}
          className="mt-4 bg-blue-500"
          children={<Text className="text-white" children="Go Back" />}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4" children={type === 'featured' ? 'Featured Products' : 'Top Categories'} />
      </View>

      {type === 'featured' ? (
        <FlatList
          data={items as Product[]}
          numColumns={2}
          contentContainerStyle={{ padding: 8 }}
          renderItem={({ item }) => (
            <View className="w-1/2 p-2">
              <ProductCard
                product={item as Product}
                onPress={() => handleProductPress((item as Product).$id)}
              />
            </View>
          )}
          keyExtractor={(item) => (item as Product).$id}
        />
      ) : (
        <FlatList
          data={items as Category[]}
          numColumns={2}
          contentContainerStyle={{ padding: 8 }}
          renderItem={({ item }) => (
            <View className="w-1/2 p-2">
              <CategoryCard
                title={(item as Category).name}
                image={{ uri: (item as Category).imageUrl }}
                onPress={() => handleCategoryPress((item as Category).categoryId)}
              />
            </View>
          )}
          keyExtractor={(item) => (item as Category).$id}
        />
      )}
    </View>
  );
};

export default ViewAllScreen; 