import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { fetchCart, updateCart, removeFromCart, clearCart } from '../../lib/handleCart';
import { useGlobalContext } from '../../context/GlobalProvider';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { createOrder } from '@/lib/handleOrder';
import { fetchUserAddress } from '@/lib/handleUser';
import { fetchPriceMultiplierByPincode, calculateAdjustedPrice } from '../../lib/handleLocation';
import { CartItem } from '../../types/CartTypes';
import { User } from '../../types/userTypes';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => Promise<void>;
  onRemoveItem: (productId: string) => Promise<void>;
}

const CartScreen: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [adjustedTotal, setAdjustedTotal] = useState<number | null>(null);

  const { user } = useGlobalContext() as { user: User | null };

  const loadCartItems = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const items = await fetchCart(user.$id);
      setCartItems(items.items || []);
      
      // Calculate total amount
      const total = items.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      setTotalAmount(total);
      
      // If user has a delivery address with pincode, calculate adjusted total
      if (user.deliveryAddress?.pincode) {
        const multiplier = await fetchPriceMultiplierByPincode(user.deliveryAddress.pincode);
        const adjusted = calculateAdjustedPrice(total, multiplier);
        setAdjustedTotal(adjusted);
      } else {
        setAdjustedTotal(null);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load cart items. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  // Refresh cart on screen focus
  useFocusEffect(
    useCallback(() => {
      loadCartItems();
    }, [loadCartItems])
  );

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (!user) return;
    
    try {
      await updateCart(user.$id, cartItems.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      ));
      await loadCartItems(); // Refresh cart data
    } catch (error) {
      console.error('Error updating quantity:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update quantity. Please try again.',
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!user) return;
    
    try {
      await removeFromCart(user.$id, productId);
      await loadCartItems(); // Refresh cart data
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Item removed from cart!',
      });
    } catch (error) {
      console.error('Error removing item:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to remove item. Please try again.',
      });
    }
  };

  const handleClearCart = async () => {
    if (!user) return;
    
    try {
      await clearCart(user.$id);
      await loadCartItems(); // Refresh cart data
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Cart cleared successfully!',
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to clear cart. Please try again.',
      });
    }
  };

  const ProceedToCheckout = async () => {
    if (loading) return; // Prevent multiple clicks
    // todo
    // prentet reload when click on button
    setLoading(true);
    // setError(null);

    try {
      // Step 1: Fetch the delivery address
      const deliveryAddress = await fetchUserAddress(user!.$id.toString());
      console.log('Delivery Address:', deliveryAddress);
      // Step 2: Create the order
      const orderId = await createOrder(user!.$id.toString(), cartItems, totalAmount, deliveryAddress);


     
      // Step 3: Clear the cart
      await clearCart(user!.$id.toString());
      setCartItems([]);  // Clear cart state

       // Step 4: Show success toast
       Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Order placed successfully!`,
      });

      // Optionally, navigate to the order details screen
      // router.push(`/order/${orderId}`);
      router.push("/orders");

    } catch (error) {
      // Step 5: Show error toast
      // setError(error instanceof Error ? error.message : 'Failed to place order');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to place the order. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View className="p-4 border-b border-gray-200 shadow-sm">
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold ml-4" children="Shopping Cart" />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient colors={['#FFFFFF', '#F3F4F6']} className="flex-1">
        {renderHeader()}

        {cartItems.length === 0 ? (
          // Empty Cart View
          <View className="flex-1 items-center justify-center p-4">
            <Ionicons name="cart-outline" size={80} color="#CBD5E0" />
            <Text className="text-xl font-bold mt-4 text-gray-700" children="Your cart is empty" />
            <Text className="text-gray-500 text-center mt-2 mb-6" children="Looks like you haven't added anything to your cart yet" />
            <Button 
              onPress={() => router.push('/home')} 
              className="bg-blue-500 px-8"
              children={<Text className="text-white" children="Start Shopping" />}
            />
          </View>
        ) : (
          // Cart Items View
          <>
            <ScrollView className="flex-1">
              {cartItems.map(item => (
                <CartItemCard
                  key={item.productId}
                  item={item}
                  onUpdateQuantity={handleQuantityChange}
                  onRemoveItem={handleRemoveItem}
                />
              ))}
            </ScrollView>

            {/* Bottom Sheet */}
            <View className="border-t border-gray-200 p-4 bg-white">
              <View className="flex-row justify-between mb-4">
                <Text className="text-gray-600" children="Total Amount" />
                <Text className="font-bold" children={`₹${totalAmount}`} />
              </View>
              {adjustedTotal !== null && adjustedTotal !== totalAmount && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Adjusted Total</Text>
                  <Text className="font-medium text-green-600">₹{adjustedTotal}</Text>
                </View>
              )}
              <Button
                onPress={ProceedToCheckout}
                className="bg-blue-500"
                disabled={loading}
                children={<Text className="text-white" children={loading ? 'Processing...' : 'Proceed to Checkout'} />}
              >
              </Button>
              <TouchableOpacity onPress={handleClearCart} className="mt-2">
                <Text className="text-red-500 text-center" children="Clear Cart" />
              </TouchableOpacity>
            </View>
          </>
        )}

        <Toast />
      </LinearGradient>
    </SafeAreaView>
  );
};

const CartItemCard: React.FC<CartItemCardProps> = React.memo(
  ({ item, onUpdateQuantity, onRemoveItem }) => (
    <TouchableOpacity onPress={() => router.push(`/product/${item.productId}`)}>
      <View className="p-4 border-b border-gray-200">
        <View className="flex-row">
          <Image source={{ uri: item.imageUrl }} className="w-24 h-24 rounded-lg" />
          <View className="flex-1 ml-4">
            <Text className="font-medium text-lg" children={item.name} />
            <Text className="text-gray-600 mt-1" children={`₹${item.price}`} />

            {/* Quantity Controls */}
            <View className="flex-row items-center mt-2">
              <TouchableOpacity
                onPress={() => onUpdateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <Ionicons name="remove" size={20} color="black" />
              </TouchableOpacity>
              <Text className="mx-4" children={item.quantity} />
              <TouchableOpacity
                onPress={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <Ionicons name="add" size={20} color="black" />
              </TouchableOpacity>
            </View>

            {/* Remove Button */}
            <TouchableOpacity
              onPress={() => onRemoveItem(item.productId)}
              className="mt-2"
            >
              <Ionicons name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
);

export default CartScreen;

