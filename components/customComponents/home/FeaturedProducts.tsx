import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
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

  if (products.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-2"
    >
      {products.map((product) => (
        <ProductCard
          key={product.$id}
          product={product}
          onPress={() => router.push(`/product/${product.$id}`)}
        />
      ))}
    </ScrollView>
  );
};

export default FeaturedProducts; 