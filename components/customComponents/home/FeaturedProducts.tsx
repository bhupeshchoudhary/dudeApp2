import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { Text } from '@/components/ui/Text';
import { fetchFeaturedProducts } from '../../../lib/fetchProducts';
import { Product } from '@/types/productTypes';
import ProductCard from '@/components/customComponents/ProductCard';
import { router } from 'expo-router';

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchFeaturedProducts();
        setProducts(data);
        console.log(`Loaded ${data.length} featured products`);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <View className="py-6 items-center">
        <ActivityIndicator size="large" color="#E86A2B" />
        <Text className="text-orange-600 mt-2" children="Loading featured products..." />
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

  if (products.length === 0) {
    return (
      <View className="py-8 items-center">
        <Text className="text-gray-500 text-center" children="No featured products available" />
      </View>
    );
  }

  // Limit to 8 items for homepage performance
  const limitedProducts = products.slice(0, 8);

  return (
    <FlatList
      data={limitedProducts}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 16 }}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <ProductCard
          key={item.$id}
          product={item}
          onPress={() => router.push(`/product/${item.$id}`)}
          large={true}
          cardWidth={140}
          cardHeight={240}
        />
      )}
    />
  );
};

export default FeaturedProducts; 