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
  price: number;
  imageUrl: string;
  $id: string;
}

const ProductOfTheDay = () => {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProductsOfTheDay = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading products of the day...");
      const productsOfTheDay = await fetchProductOfTheDay();
      console.log("Products of the day received:", productsOfTheDay);
      console.log("Number of products:", productsOfTheDay?.length || 0);
      
      if (productsOfTheDay && productsOfTheDay.length > 0) {
        setProducts(productsOfTheDay);
        console.log("Set products successfully:", productsOfTheDay.length);
      } else {
        console.log("No products found, setting to null");
        setProducts(null);
      }
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
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-orange-200">
        <View className="flex-row items-center mb-4">
          <View className="bg-orange-500 rounded-full p-2 mr-3">
            <Text className="text-white text-lg font-bold">🔥</Text>
          </View>
          <Text className="text-xl font-bold text-orange-800" children="Products of the Day" />
        </View>
        
        {loading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#f97316" />
            <Text className="text-orange-600 mt-2" children="Loading amazing deals..." />
          </View>
        ) : error ? (
          <View className="py-4 items-center">
            <Text className="text-red-500 text-center" children={error} />
          </View>
        ) : !products || products.length === 0 ? (
          <View className="py-8 items-center">
            <Text className="text-gray-500 text-center" children="No products available today" />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
            className="py-2"
          >
            {products.map((product, index) => {
              console.log(`Rendering product ${index}:`, product.name);
              return (
                <ProductCard
                  key={product.$id || product.productId || index}
                  image={{ uri: product.imageUrl }}
                  name={product.name}
                  price={`₹${product.price}`}
                  onPress={() => handleProductPress(product.$id)}
                  large={true}
                />
              );
            })}
          </ScrollView>
        )}
      </Card>
    </View>
  );
};

export default ProductOfTheDay;