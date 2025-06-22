import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { fetchFeaturedProducts, fetchTopCategories } from '@/lib/fetchProducts';
import { Product } from '@/types/productTypes';
import { Category } from '@/types/categoryTypes';
import ProductCard from '@/components/customComponents/ProductCard';
import { CategoryCard } from '@/components/customComponents/CategoryCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ViewAllScreen = () => {
  const { type } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const [items, setItems] = useState<Product[] | Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const title = type === 'featured' ? 'Featured Products' : 'Top Categories';

  useEffect(() => {
    navigation.setOptions({
      title,
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
      headerShown: true,
    });

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
  }, [type, navigation]);

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#E86A2B" />
        <Text className="text-gray-600 mt-4">Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="text-red-500 text-center text-lg mt-4" children={error} />
        <Button
          onPress={() => router.back()}
          className="mt-6 bg-orange-500 px-6 py-3 rounded-full"
          children={<Text className="text-white font-medium" children="Go Back" />}
        />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {type === 'featured' ? (
        <FlatList
          data={items as Product[]}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <View style={{ width: '48%', marginBottom: 16 }}>
              <ProductCard
                product={item as Product}
                onPress={() => handleProductPress((item as Product).$id)}
                showAddToCart={true}
              />
            </View>
          )}
          keyExtractor={(item) => (item as Product).$id}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={items as Category[]}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <View style={{ width: '48%', marginBottom: 16 }}>
              <CategoryCard
                title={(item as Category).name}
                image={{ uri: (item as Category).imageUrl }}
                onPress={() => handleCategoryPress((item as Category).$id)}
              />
            </View>
          )}
          keyExtractor={(item) => (item as Category).$id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default ViewAllScreen; 