import React, { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { fetchProductsById, fetchRelatedProducts, testRelatedProductsFunctionality, fetchFeaturedProducts } from '../../lib/fetchProducts';
import { Product } from '../../types/productTypes';
import ProductCard from '../../components/customComponents/ProductCard';
import { addToCart, fetchCart, updateCart } from '../../lib/handleCart';
import { useGlobalContext } from '@/context/GlobalProvider';
import QuantityModal from '@/components/customComponents/cart/CartDialogBox';
import { fetchPriceMultiplierByPincode, calculateAdjustedPrice } from '../../lib/handleLocation';
import { User } from '../../types/userTypes';
import { Ionicons } from '@expo/vector-icons';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface QuickAddButtonProps {
  quantity: number;
  onPress: () => void;
  isLoading: boolean;
  disabled: boolean;
  currentCartQuantity?: number;
}

const QuickAddButton: React.FC<QuickAddButtonProps> = ({ 
  quantity, 
  onPress, 
  isLoading, 
  disabled, 
  currentCartQuantity = 0 
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || isLoading}
    className={`
      flex-row items-center justify-center px-4 py-3 rounded-lg border-2 min-w-[80px]
      ${disabled ? 'bg-gray-100 border-gray-200' : 'bg-blue-50 border-blue-200 active:bg-blue-100'}
    `}
    activeOpacity={0.7}
  >
    {isLoading ? (
      <ActivityIndicator size="small" color="#3B82F6" />
    ) : (
      <>
        <Ionicons 
          name="add-circle" 
          size={16} 
          color={disabled ? "#9CA3AF" : "#3B82F6"} 
          style={{ marginRight: 4 }}
        />
        <Text 
          className={`font-semibold ${disabled ? 'text-gray-400' : 'text-blue-600'}`}
          children={`+${quantity}`}
        />
        {currentCartQuantity > 0 && (
          <Text 
            className="text-xs text-green-600 ml-1" 
            children={`(${currentCartQuantity})`}
          />
        )}
      </>
    )}
  </TouchableOpacity>
);

const ProductScreen = () => {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [error, setError] = useState('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quickAddLoading, setQuickAddLoading] = useState<number | null>(null);
  const { user } = useGlobalContext() as { user: User | null };
  const [isQuantityModalVisible, setIsQuantityModalVisible] = useState(false);
  const [adjustedPrice, setAdjustedPrice] = useState<number | null>(null);

  // Dynamic quick add quantities based on product type/stock
  const getQuickAddQuantities = (product: Product) => {
    const stock = product.stock;
    const unit = product.unit?.toLowerCase() || '';
    
    // For items sold by piece/kg/liters
    if (unit.includes('kg') || unit.includes('ltr') || unit.includes('litre')) {
      return stock >= 10 ? [1, 2, 5, 10] : stock >= 5 ? [1, 2, 5] : [1, 2];
    }
    
    // For items sold by pieces
    if (unit.includes('piece') || unit.includes('pcs')) {
      return stock >= 50 ? [5, 10, 25, 50] : stock >= 25 ? [5, 10, 25] : stock >= 10 ? [5, 10] : [1, 5];
    }
    
    // Default quantities
    return stock >= 20 ? [1, 5, 10, 20] : stock >= 10 ? [1, 5, 10] : stock >= 5 ? [1, 5] : [1];
  };

  // Check cart quantity for this specific product
  const checkCartQuantity = async () => {
    if (!user || !product) return;
    try {
      const cart = await fetchCart(user.$id);
      const cartItem = cart.items.find((item: CartItem) => item.productId === id);
      setCartQuantity(cartItem ? cartItem.quantity : 0);
    } catch (error) {
      console.error('Error checking cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to check cart status. Please try again.',
      });
    }
  };

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      try {
        setIsProductLoading(true);
        setError('');
        
        const productData = await fetchProductsById(id.toString());
        
        if (productData) {
          setProduct(productData);
          console.log('Product loaded:', {
            id: productData.$id,
            name: productData.name,
            categoryId: productData.categoryId
          });
          
          // Run test function to debug related products
          await testRelatedProductsFunctionality();
          
          // If user has a delivery address with pincode, calculate adjusted price
          if (productData && user?.deliveryAddress?.pincode) {
            const multiplier = await fetchPriceMultiplierByPincode(user.deliveryAddress.pincode);
            const adjusted = calculateAdjustedPrice(productData.price, multiplier);
            setAdjustedPrice(adjusted);
          } else {
            setAdjustedPrice(null);
          }
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product. Please try again.');
      } finally {
        setIsProductLoading(false);
      }
    };

    loadProduct();
  }, [id, user?.deliveryAddress?.pincode]);

  // Check cart when product loads or changes
  useEffect(() => {
    checkCartQuantity();
  }, [product, user]);

  // Fetch related products
  useEffect(() => {
    const loadRelatedProducts = async () => {
      if (!product) return;

      try {
        setIsRelatedLoading(true);
        console.log('Loading related products for product:', {
          productId: product.$id,
          productName: product.name,
          categoryId: product.categoryId
        });
        
        // Use the new fetchRelatedProducts function
        const relatedProductsData = await fetchRelatedProducts(
          product.$id, 
          6 // Limit to 6 related products
        );
        
        console.log('Related products loaded:', {
          count: relatedProductsData.length,
          products: relatedProductsData.map(p => ({ id: p.$id, name: p.name, categoryId: p.categoryId }))
        });
        
        // If no related products found, try to get featured products as fallback
        if (relatedProductsData.length === 0) {
          console.log('No related products found, trying featured products as fallback...');
          try {
            const featuredProductsData = await fetchFeaturedProducts();
            const filteredFeatured = featuredProductsData
              .filter(p => p.$id !== product.$id)
              .slice(0, 6);
            
            console.log('Featured products fallback loaded:', filteredFeatured.length);
            setRelatedProducts(filteredFeatured);
          } catch (fallbackError) {
            console.error('Featured products fallback also failed:', fallbackError);
            setRelatedProducts([]);
          }
        } else {
          setRelatedProducts(relatedProductsData);
        }
        
        console.log(`Loaded ${relatedProductsData.length} related products`);
        
        // Additional debugging for mobile
        if (relatedProductsData.length === 0) {
          console.warn('No related products found - this might indicate a data issue');
        }
      } catch (error) {
        console.error('Failed to fetch related products:', error);
        
        // Try featured products as fallback
        try {
          console.log('Trying featured products as fallback due to error...');
          const featuredProductsData = await fetchFeaturedProducts();
          const filteredFeatured = featuredProductsData
            .filter(p => p.$id !== product.$id)
            .slice(0, 6);
          
          console.log('Featured products fallback loaded after error:', filteredFeatured.length);
          setRelatedProducts(filteredFeatured);
        } catch (fallbackError) {
          console.error('Featured products fallback also failed:', fallbackError);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load related products.',
          });
          setRelatedProducts([]); // Ensure we set empty array on error
        }
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
      
      if (cartQuantity > 0) {
        // Update existing cart item
        const cart = await fetchCart(user.$id);
        const updatedItems = cart.items.map((item: CartItem) =>
          item.productId === product.$id 
            ? { ...item, quantity: cartQuantity + quantity }
            : item
        );
        await updateCart(user.$id, updatedItems);
      } else {
        // Add new item to cart
        await addToCart(
          user.$id, 
          product.$id, 
          quantity,
          adjustedPrice || product.price, 
          product.imageUrl, 
          product.name,
          user.deliveryAddress?.pincode
        );
      }
      
      const newCartQuantity = cartQuantity + quantity;
      setCartQuantity(newCartQuantity);
      
      Toast.show({
        type: 'success',
        text1: 'Added to Cart!',
        text2: `${quantity} ${product.unit || 'item'}${quantity > 1 ? 's' : ''} added. Total: ${newCartQuantity}`,
        visibilityTime: 3000,
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

  const handleQuickAdd = async (quantity: number) => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please log in to add items to your cart.',
      });
      return;
    }

    if (!product) return;

    // Check if adding this quantity would exceed stock
    if (cartQuantity + quantity > product.stock) {
      Toast.show({
        type: 'error',
        text1: 'Insufficient Stock',
        text2: `Only ${product.stock - cartQuantity} more items available`,
      });
      return;
    }

    try {
      setQuickAddLoading(quantity);
      
      if (cartQuantity > 0) {
        // Update existing cart item
        const cart = await fetchCart(user.$id);
        const updatedItems = cart.items.map((item: CartItem) =>
          item.productId === product.$id 
            ? { ...item, quantity: cartQuantity + quantity }
            : item
        );
        await updateCart(user.$id, updatedItems);
      } else {
        // Add new item to cart
        await addToCart(
          user.$id, 
          product.$id, 
          quantity,
          adjustedPrice || product.price, 
          product.imageUrl, 
          product.name,
          user.deliveryAddress?.pincode
        );
      }
      
      const newCartQuantity = cartQuantity + quantity;
      setCartQuantity(newCartQuantity);
      
      Toast.show({
        type: 'success',
        text1: `+${quantity} Added!`,
        text2: `${newCartQuantity} ${product.unit || 'item'}${newCartQuantity > 1 ? 's' : ''} in cart`,
        visibilityTime: 2500,
      });
    } catch (error) {
      console.error('Error in quick add:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add product to cart. Please try again.',
      });
    } finally {
      setQuickAddLoading(null);
    }
  };

  const handleCartAction = () => {
    if (cartQuantity > 0) {
      router.push('/cart');
    } else {
      setIsQuantityModalVisible(true);
    }
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  // Memoize related products
  const memoizedRelatedProducts = useMemo(() => {
    console.log('Memoizing related products:', {
      count: relatedProducts.length,
      products: relatedProducts.map(p => ({ id: p.$id, name: p.name }))
    });
    return relatedProducts;
  }, [relatedProducts]);

  // Debug logging for mobile visibility
  useEffect(() => {
    console.log('Related products state changed:', {
      count: relatedProducts.length,
      isLoading: isRelatedLoading,
      hasProducts: relatedProducts.length > 0
    });
  }, [relatedProducts, isRelatedLoading]);

  if (isProductLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
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

  const quickAddQuantities = getQuickAddQuantities(product);

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
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
          <Text className="text-2xl font-bold text-green-600" children={`₹${adjustedPrice || product.price}`} />
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
          <Text className="text-blue-600 font-medium" children={`Unit: ${product.unit || 'kg'}`} />
        </View>

        {/* Stock Availability and Cart Status */}
        <View className="mt-2 flex-row items-center justify-between">
          <Text 
            className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}
            children={product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
          />
          {cartQuantity > 0 && (
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-700 font-semibold text-sm" children={`${cartQuantity} in cart`} />
            </View>
          )}
        </View>

        {/* Quick Add Section */}
        {product.stock > 0 && (
          <View className="mt-6">
            <Text className="text-lg font-bold mb-3" children={cartQuantity > 0 ? "Add More to Cart" : "Quick Add to Cart"} />
            <View className="flex-row flex-wrap gap-3">
              {quickAddQuantities.map((quantity) => (
                <QuickAddButton
                  key={quantity}
                  quantity={quantity}
                  onPress={() => handleQuickAdd(quantity)}
                  isLoading={quickAddLoading === quantity}
                  disabled={cartQuantity + quantity > product.stock || quickAddLoading !== null}
                  currentCartQuantity={cartQuantity}
                />
              ))}
            </View>
            <Text className="text-gray-500 text-sm mt-2" children={
              cartQuantity > 0 
                ? "Tap to add more items to your cart" 
                : "Tap to add specific quantities instantly"
            } />
          </View>
        )}

        {/* Main Add to Cart/Go to Cart Button */}
        <View className="mt-6 flex-row gap-3">
          <Button
            onPress={handleCartAction}
            className={`flex-1 ${cartQuantity > 0 ? 'bg-orange-500' : 'bg-orange-500'}`}
            disabled={product.stock <= 0 || isAddingToCart}
            accessibilityRole="button"
            accessibilityLabel={
              product.stock <= 0 
                ? 'Out of Stock' 
                : cartQuantity > 0 
                  ? 'Go to Cart' 
                  : 'Add to Cart'
            }
            children={
              <View className="flex-row items-center justify-center">
                <Ionicons 
                  name={cartQuantity > 0 ? "cart" : "add-circle"} 
                  size={20} 
                  color="white" 
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white font-semibold" children={
                  isAddingToCart 
                    ? 'Adding...' 
                    : product.stock <= 0 
                      ? 'Out of Stock' 
                      : cartQuantity > 0 
                        ? 'View Cart' 
                        : 'Custom Quantity'
                } />
              </View>
            }
          />
        </View>

        {/* Product Description */}
        <View className="mt-6">
          <Text className="font-bold text-lg mb-2" children="Product Description" />
          <Text className="text-gray-600 leading-6" children={product.description} />
        </View>

        {/* Product Info Cards */}
        <View className="mt-6 flex-row flex-wrap gap-3">
          <View className="bg-[#F7C873] px-3 py-2 rounded-lg flex-1 min-w-[120px]">
            <Text className="text-[#E86A2B] font-medium text-sm" children="Unit" />
            <Text className="text-[#E86A2B] font-semibold" children={product.unit || 'kg'} />
          </View>
          <View className="bg-[#EBA05C] px-3 py-2 rounded-lg flex-1 min-w-[120px]">
            <Text className="text-[#7C4A1E] font-medium text-sm" children="Available" />
            <Text className="text-[#7C4A1E] font-semibold" children={`${product.stock - cartQuantity} left`} />
          </View>
          {cartQuantity > 0 && (
            <View className="bg-[#E86A2B] px-3 py-2 rounded-lg flex-1 min-w-[120px]">
              <Text className="text-[#F7C873] font-medium text-sm" children="In Cart" />
              <Text className="text-[#F7C873] font-semibold" children={`${cartQuantity}`} />
            </View>
          )}
        </View>

        {/* Related Products */}
        <View className="mt-8 mb-8">
          <Text className="text-xl font-bold mb-4 px-4" children="Related Products" />
          {isRelatedLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-500 mt-4" children="Loading related products..." />
            </View>
          ) : memoizedRelatedProducts.length > 0 ? (
            <View className="flex-1">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ 
                  paddingHorizontal: 16,
                  paddingRight: 32,
                  gap: 12,
                  minHeight: 240
                }}
                className="flex-row"
                style={{ minHeight: 240 }}
                bounces={false}
                decelerationRate="fast"
              >
                {memoizedRelatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.$id}
                    product={relatedProduct}
                    onPress={() => handleProductPress(relatedProduct.$id)}
                    isRelatedProduct={true}
                  />
                ))}
              </ScrollView>
            </View>
          ) : (
            <View className="items-center py-8 bg-gray-50 rounded-lg mx-4">
              <Text className="text-gray-500 text-center mb-2" children="No related products available" />
              <Text className="text-gray-400 text-sm text-center mb-4" children="Try browsing other categories" />
              <Button
                onPress={() => router.push('/categories')}
                className="bg-blue-500 px-4 py-2 rounded-lg"
                children={<Text className="text-white font-medium" children="Browse Categories" />}
              />
            </View>
          )}
        </View>
      </View>

      {/* Quantity Modal */}
      <QuantityModal
        visible={isQuantityModalVisible}
        onClose={() => setIsQuantityModalVisible(false)}
        onConfirm={handleAddToCart}
        maxQuantity={product.stock - cartQuantity}
        currentCartQuantity={cartQuantity}
      />

      <Toast />
    </ScrollView>
  );
};

export default ProductScreen;