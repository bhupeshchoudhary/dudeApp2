import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { fetchCart, updateCart, removeFromCart, clearCart } from '../../lib/handleCart';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { createOrder } from '@/lib/handleOrder';
import { fetchUserAddress } from '@/lib/handleUser';
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => Promise<void>;
  onRemoveItem: (productId: string) => Promise<void>;
}

const CartScreen: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useGlobalContext();

  const loadCart = useCallback(async () => {
    try {
      const userId = user?.$id.toString();
      const cart = await fetchCart(userId || '');
      setCartItems(cart.items || []);

      console.log('Cart items:', cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load cart. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Refresh cart on screen focus
  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart])
  );

  const updateQuantity = async (productId: string, newQuantity: number) => {
    try {
      if (newQuantity === 0) {
        await handleRemoveItem(productId);
        return;
      }

      const userId = user?.$id.toString();
      const updatedItems = cartItems.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );
      await updateCart(userId || '', updatedItems);
      await loadCart(); // Refresh cart data
      // Toast.show({
      //   type: 'success',
      //   text1: 'Success',
      //   text2: 'Quantity updated successfully!',
      // });
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
    try {
      const userId = user?.$id.toString();
      await removeFromCart(userId || '', productId);
      await loadCart(); // Refresh cart data
      // Toast.show({
      //   type: 'success',
      //   text1: 'Success',
      //   text2: 'Item removed from cart!',
      // });
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
    try {
      const userId = user?.$id.toString();
      await clearCart(userId || '');
      await loadCart(); // Refresh cart data
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

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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
          <Text children="Loading..." />
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
                  onUpdateQuantity={updateQuantity}
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
              {/* // Update the Button component in the bottom sheet section */}
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
    <TouchableOpacity onPress={() => handleProductPress(item.productId)}>
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

function handleProductPress(productId: string): void {
  router.push(`/product/${productId}`);
}

export default CartScreen;