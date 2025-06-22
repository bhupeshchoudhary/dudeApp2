// app/category/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '../../components/ui/Text';
import ProductCard from '../../components/customComponents/ProductCard';
import { fetchProductsByCategoryId, fetchRelatedProducts } from '../../lib/fetchProducts';
import { Product } from '../../types/productTypes';
import { Category } from '../../types/categoryTypes';
import { databases, appwriteConfig } from '../../lib/appwrite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const CategoryScreen = () => {
  const { id } = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load category and products in parallel
        const [categoryData, productsData] = await Promise.all([
          databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
            id.toString()
          ),
          fetchProductsByCategoryId(id.toString())
        ]);

        setCategory({
          $id: categoryData.$id,
          name: categoryData.name,
          imageUrl: categoryData.imageUrl,
          categoryId: categoryData.categoryId
        });
        
        setProducts(productsData);
        setProductCount(productsData.length);
        console.log(`Loaded ${productsData.length} products for category: ${categoryData.name}`);
      } catch (error) {
        console.error('Error loading category data:', error);
        setError('Failed to load category data. Please try again.');
        setProducts([]);
        setCategory(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const renderHeader = () => (
    <View className="bg-white">
      <LinearGradient
        colors={["#F7C873", "#EBA05C", "#E86A2B", "#7C4A1E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="px-4 py-6"
      >
        <View className="flex-row items-center mb-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4 p-2 rounded-full bg-white/20"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white flex-1">
            {category?.name || 'Category'}
          </Text>
          <View className="bg-white/20 px-3 py-1 rounded-full">
            <Text className="text-white text-sm font-medium">
              {productCount}
            </Text>
          </View>
        </View>
        
        {category && (
          <View className="bg-white/10 rounded-lg p-3">
            <Text className="text-white text-sm">
              Browse through {productCount} products in {category.name}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );

  const renderProductItem = ({ item: product }: { item: Product }) => (
    <View style={{ width: '48%', marginBottom: 16 }}>
      <ProductCard
        product={product}
        onPress={() => router.push(`/product/${product.$id}`)}
        showAddToCart={true}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-16">
      <Ionicons name="bag-outline" size={64} color="#D1D5DB" />
      <Text className="text-gray-500 text-lg font-medium mt-4 mb-2">
        {error ? 'Failed to load products' : 'No products available'}
      </Text>
      <Text className="text-gray-400 text-center px-8">
        {error ? 
          'Please check your connection and try again' :
          'This category doesn\'t have any products yet'
        }
      </Text>
      {error && (
        <TouchableOpacity
          onPress={() => {
            setIsLoading(true);
            setError(null);
            // Reload data
            const loadData = async () => {
              try {
                const [categoryData, productsData] = await Promise.all([
                  databases.getDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.categoriesCollectionId,
                    id.toString()
                  ),
                  fetchProductsByCategoryId(id.toString())
                ]);

                setCategory({
                  $id: categoryData.$id,
                  name: categoryData.name,
                  imageUrl: categoryData.imageUrl,
                  categoryId: categoryData.categoryId
                });
                
                setProducts(productsData);
                setProductCount(productsData.length);
              } catch (error) {
                setError('Failed to load category data. Please try again.');
              } finally {
                setIsLoading(false);
              }
            };
            loadData();
          }}
          className="mt-4 bg-[#E86A2B] px-6 py-3 rounded-full"
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator size="large" color="#E86A2B" />
      <Text className="text-gray-500 text-lg font-medium mt-4">
        Loading products...
      </Text>
      <Text className="text-gray-400 text-sm mt-2">
        Please wait while we fetch all products
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {renderHeader()}
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {renderHeader()}
      
      {!category || products.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.$id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <Toast />
    </SafeAreaView>
  );
};

export default CategoryScreen;