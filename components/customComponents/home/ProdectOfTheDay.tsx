import React, { useCallback, useEffect, useState } from "react";
import { View, ActivityIndicator, FlatList, ScrollView } from "react-native";
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
  const [error, setError] = useState<string | null>(null);

  const loadProductsOfTheDay = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsOfTheDay = await fetchProductOfTheDay();
      setProducts(productsOfTheDay && productsOfTheDay.length > 0 ? productsOfTheDay : null);
    } catch (error) {
      console.error("Failed to load products of the day:", error);
      setError("Failed to load products of the day");
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

  return (
    <View className="p-4">
      <Card className="bg-yellow-50 p-4 rounded-lg">
        <Text className="text-lg font-bold mb-4" children="Products of the Day" />
        
        {loading ? (
          <View className="py-4">
            <ActivityIndicator size="small" color="#000" />
          </View>
        ) : error ? (
          <Text className="text-red-500" children={error} />
        ) : !products || products.length === 0 ? (
          <Text className="text-gray-500" children="No products available" />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {products.map((product) => (
              <ProductCard
                key={product.productId}
                image={{ uri: product.imageUrl }}
                name={product.name}
                price={product.price}
                onPress={() => handleProductPress(product.productId)}
              />
            ))}
          </ScrollView>
        )}
      </Card>
    </View>
  );
};

export default ProductOfTheDay;