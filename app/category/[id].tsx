// app/category/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { ProductCard } from '../../components/ui/ProductCard';
import { fetchProductsByCategoryId } from '../../lib/fetchProducts';
import { Product } from '../../types/productTypes';
import { Category } from '../../types/categoryTypes';
import { databases, appwriteConfig } from '../../lib/appwrite';
import { SafeAreaView } from 'react-native-safe-area-context';

const CategoryScreen = () => {
  const { id } = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productsData, categoryData] = await Promise.all([
          fetchProductsByCategoryId(id.toString()),
          databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
            id.toString()
          )
        ]);
        setProducts(productsData);
        setCategory({
          $id: categoryData.$id,
          name: categoryData.name,
          imageUrl: categoryData.imageUrl,
          categoryId: categoryData.categoryId
        });
      } catch (error) {
        // Silently handle errors
        setProducts([]);
        setCategory(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // If no category or products, show empty state
  if (!category || products.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-gray-500 text-center" children="No products available in this category" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-green-500 px-4 py-4">
        <Text className="text-white text-2xl font-bold" children={category.name} />
      </View>

      {/* Products Grid */}
      <ScrollView className="flex-1">
        <View className="p-4">
          <View className="flex-row flex-wrap justify-between">
            {products.map((product) => (
              <ProductCard
                key={product.$id}
                image={{ uri: product.imageUrl }}
                name={product.name}
                price={`₹${product.price}`}
                mrp={product.mrp ? `₹${product.mrp}` : undefined}
                discount={product.discount ? `${product.discount}% OFF` : undefined}
                onPress={() => router.push(`/product/${product.$id}`)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CategoryScreen;