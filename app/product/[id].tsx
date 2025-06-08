import React, { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, Image, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { fetchProductsById, fetchProductsByCategoryId } from '../../lib/fetchProducts';
import { Product } from '../../types/productTypes';
import ProductCard from '../../components/customComponents/ProductCard';
import { addToCart, fetchCart } from '../../lib/handleCart';
import { useGlobalContext } from '@/context/GlobalProvider';
import QuantityModal from '@/components/customComponents/cart/CartDialogBox';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

const ProductScreen = () => {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [error, setError] = useState('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isInCart, setIsInCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { user } = useGlobalContext();
  const [isQuantityModalVisible, setIsQuantityModalVisible] = useState(false);

  // Check if product is in cart
  const checkIfInCart = async () => {
    if (!user || !product) return;
    try {
      const cart = await fetchCart(user.$id);
      const isItemInCart = cart.items.some((item: CartItem) => item.productId === id);
      setIsInCart(isItemInCart);
    } catch (error) {
      console.error('Error checking cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to check cart status. Please try again.',
      });
    }
  };

  // Fetch product details
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Invalid product ID');
        setIsProductLoading(false);
        return;
      }

      try {
        setIsProductLoading(true);
        setError('');
        const productData = await fetchProductsById(id.toString());
        if (productData) {
          setProduct(productData);
        } else {
          setError('Product not found.');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to fetch product details. Please try again.');
      } finally {
        setIsProductLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Check cart when product loads or changes
  useEffect(() => {
    checkIfInCart();
  }, [product, user]);

  // Fetch related products
  useEffect(() => {
    const loadRelatedProducts = async () => {
      if (!product) return;

      try {
        setIsRelatedLoading(true);
        const products = await fetchProductsByCategoryId(product.categoryId);
        // Filter out the current product from related products
        const filteredProducts = products.filter(p => p.$id !== product.$id);
        setRelatedProducts(filteredProducts);
      } catch (error) {
        console.error('Failed to fetch related products:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load related products.',
        });
      } finally {
        setIsRelatedLoading(false);
      }
    };

    loadRelatedProducts();
  }, [product]);

  const handleAddToCart = async (quantity: number = 1) => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please log in to add items to your cart.',
      });
      return;
    }

    if (!product) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Product information is missing.',
      });
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(
        user.$id, 
        product.$id, 
        quantity,
        product.price, 
        product.imageUrl, 
        product.name
      );
      setIsInCart(true);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Product added to cart!',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add product to cart. Please try again.',
      });
    } finally {
      setIsAddingToCart(false);
      setIsQuantityModalVisible(false);
    }
  };

  const handleCartAction = () => {
    if (isInCart) {
      router.push('/cart');
    } else {
      setIsQuantityModalVisible(true);
    }
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  // Memoize related products
  const memoizedRelatedProducts = useMemo(() => relatedProducts, [relatedProducts]);

  if (isProductLoading) {
    return (
      <View className="flex-1 justify-center items-center ">
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

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center" children="Product not found." />
        <Button
          onPress={() => router.back()}
          className="mt-4 bg-blue-500"
          children={<Text className="text-white" children="Go Back" />}
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Product Image */}
      <Image
        source={{ uri: product.imageUrl }}
        className="w-full h-80"
        resizeMode="cover"
        accessibilityRole="image"
        accessibilityLabel={product.name}
      />

      {/* Product Details */}
      <View className="p-4">
        {/* Product Name */}
        <Text className="text-2xl font-bold" children={product.name} />

        {/* Price and Discount */}
        <View className="flex-row items-center mt-4">
          <Text className="text-2xl font-bold" children={`₹${product.price}`} />
          {product.mrp && (
            <Text className="text-gray-500 line-through ml-2" children={`₹${product.mrp}`} />
          )}
          {product.discount && (
            <View className="bg-green-100 px-2 py-1 rounded ml-2">
              <Text className="text-green-700 text-sm" children={`${product.discount}% OFF`} />
            </View>
          )}
        </View>

        {/* Unit */}
        <View className="mt-2">
          <Text className="text-green-600" children={`Unit: ${product.unit || 'kg'}`} />
        </View>

        {/* Stock Availability */}
        <View className="mt-4">
          <Text 
            className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}
            children={product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          />
        </View>

        {/* Product Description */}
        <View className="mt-6">
          <Text className="font-bold text-lg mb-2" children="Product Description" />
          <Text className="text-gray-600" children={product.description} />
        </View>

        {/* Add to Cart/Go to Cart Button */}
        <Button
          onPress={handleCartAction}
          className={`mt-6 ${isInCart ? 'bg-green-500' : 'bg-blue-500'}`}
          disabled={product.stock <= 0 || isAddingToCart}
          accessibilityRole="button"
          accessibilityLabel={
            product.stock <= 0 
              ? 'Out of Stock' 
              : isInCart 
                ? 'Go to Cart' 
                : 'Add to Cart'
          }
          children={
            <Text className="text-white" children={
              isAddingToCart 
                ? 'Adding...' 
                : product.stock <= 0 
                  ? 'Out of Stock' 
                  : isInCart 
                    ? 'Go to Cart' 
                    : 'Add to Cart'
            } />
          }
        />

        {/* Related Products */}
        {memoizedRelatedProducts.length > 0 && (
          <View className="mt-8">
            <Text className="text-xl font-bold mb-4" children="Related Products" />
            {isRelatedLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                {memoizedRelatedProducts.map((relatedProduct) => (
                  <View key={relatedProduct.$id} className="mr-4">
                    <ProductCard
                      product={relatedProduct}
                      onPress={() => handleProductPress(relatedProduct.$id)}
                    />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {/* Quantity Modal */}
      <QuantityModal
        visible={isQuantityModalVisible}
        onClose={() => setIsQuantityModalVisible(false)}
        onConfirm={handleAddToCart}
        maxQuantity={product.stock}
      />
    </ScrollView>
  );
};

export default ProductScreen;