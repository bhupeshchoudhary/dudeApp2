







import React, { useCallback, useEffect, useState } from "react";
import { View, ActivityIndicator, FlatList } from "react-native";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import ProductCard from "../ProductCard";
import { router } from "expo-router";
import { fetchProductOfTheDay } from "@/lib/ProductOfTheDayFun";

// Define types for state
interface Product {
  productId: string;
  name: string;
  price: string;
  imageUrl: string;
}

const ProductOfTheDay = () => {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProductsOfTheDay = async () => {
    try {
      const productsOfTheDay = await fetchProductOfTheDay();
      // Only set products if we have valid ones
      setProducts(productsOfTheDay && productsOfTheDay.length > 0 ? productsOfTheDay : null);
    } catch (error) {
      console.error("Failed to load products of the day:", error);
      setProducts(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductsOfTheDay();
  }, []);

  const handleProductPress = useCallback((productId: string) => {
    router.push(`/product/${productId}`);
  }, []);

  // Don't show anything while loading - this avoids flickering
  if (loading) {
    return null;
  }

  // If no products available or error occurred, don't render anything
  if (!products || products.length === 0) {
    return null;
  }

  // Only render if we have products
  return (
    <View className="p-4">
      <Card className="bg-yellow-50 p-4 rounded-lg">
        <Text className="text-lg font-bold">Products of the Day</Text>
        <FlatList
          data={products}
          keyExtractor={(item) => item.productId}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10, gap: 10 }}
          initialNumToRender={4}
          removeClippedSubviews={true}
          renderItem={({ item }) => (
            <ProductCard
              image={{ uri: item.imageUrl }}
              name={item.name}
              price={item.price}
              onPress={() => handleProductPress(item.productId)}
            />
          )}
        />
      </Card>
    </View>
  );
};

export default ProductOfTheDay;