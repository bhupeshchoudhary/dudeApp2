import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  RefreshControl,
  TextInput,
  Alert,
  Modal
} from 'react-native';
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
import { fetchUserAddress, updateUserRatanaCash, fetchUserDetails } from '@/lib/handleUser';
import { fetchPriceMultiplierByPincode, calculateAdjustedPrice } from '../../lib/handleLocation';
import { CartItem } from '../../types/CartTypes';
import { User } from '../../types/userTypes';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => Promise<void>;
}

interface QuantityModalProps {
  visible: boolean;
  currentQuantity: number;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
}

const QuantityModal: React.FC<QuantityModalProps> = ({ visible, currentQuantity, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState(currentQuantity.toString());

  useEffect(() => {
    setQuantity(currentQuantity.toString());
  }, [currentQuantity]);

  const handleConfirm = () => {
    const newQuantity = parseInt(quantity) || 1;
    if (newQuantity > 0) {
      onConfirm(newQuantity);
      onClose();
    } else {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity greater than 0');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-6 rounded-lg mx-4 w-80">
          <Text className="text-lg font-bold mb-4">Enter Quantity</Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg p-3 mb-4 text-center text-lg"
            placeholder="Enter quantity"
            selectTextOnFocus
          />
          <View className="flex-row justify-end gap-3">
            <TouchableOpacity onPress={onClose} className="px-4 py-2">
              <Text className="text-gray-600">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} className="bg-orange-500 px-6 py-2 rounded-lg">
              <Text className="text-white font-medium">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CartScreen: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [adjustedTotal, setAdjustedTotal] = useState<number | null>(null);
  const [quantityModal, setQuantityModal] = useState<{
    visible: boolean;
    productId: string;
    currentQuantity: number;
  }>({
    visible: false,
    productId: '',
    currentQuantity: 1
  });
  const [showRatanaCashModal, setShowRatanaCashModal] = useState(false);
  const [useRatanaCash, setUseRatanaCash] = useState(false);
  const [ratanaCashToUse, setRatanaCashToUse] = useState(0);
  const [finalTotal, setFinalTotal] = useState<number | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);

  const { user } = useGlobalContext() as { user: User | null };

  const calculateTotals = useCallback(async (items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalAmount(total);
    
    // If user has a delivery address with pincode, calculate adjusted total
    if (user?.deliveryAddress?.pincode) {
      try {
        const multiplier = await fetchPriceMultiplierByPincode(user.deliveryAddress.pincode);
        const adjusted = calculateAdjustedPrice(total, multiplier);
        setAdjustedTotal(adjusted);
      } catch (error) {
        console.error('Error calculating adjusted price:', error);
        setAdjustedTotal(null);
      }
    } else {
      setAdjustedTotal(null);
    }
  }, [user]);

  const loadCartItems = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const items = await fetchCart(user.$id);
      setCartItems(items.items || []);
      await calculateTotals(items.items || []);
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
  }, [user, calculateTotals]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadCartItems();
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadCartItems]);

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

  // Optimistic update for quantity changes
  const handleQuantityChange = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    // Optimistic update
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );
      calculateTotals(updatedItems);
      return updatedItems;
    });

    // Background update
    if (user) {
      updateCart(user.$id, cartItems.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )).catch(error => {
        console.error('Error updating quantity:', error);
        // Revert on error
        loadCartItems();
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to update quantity. Please try again.',
        });
      });
    }
  }, [user, cartItems, calculateTotals, loadCartItems]);

  const handleRemoveItem = async (productId: string) => {
    if (!user) return;
    
    try {
      // Optimistic update
      const updatedItems = cartItems.filter(item => item.productId !== productId);
      setCartItems(updatedItems);
      await calculateTotals(updatedItems);

      await removeFromCart(user.$id, productId);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Item removed from cart!',
      });
    } catch (error) {
      console.error('Error removing item:', error);
      // Revert on error
      loadCartItems();
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to remove item. Please try again.',
      });
    }
  };

  const handleClearCart = async () => {
    if (!user) return;
    
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart(user.$id);
              setCartItems([]);
              setTotalAmount(0);
              setAdjustedTotal(null);
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
          }
        }
      ]
    );
  };

  const handleQuantityModalConfirm = (quantity: number) => {
    handleQuantityChange(quantityModal.productId, quantity);
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (user) {
        const details = await fetchUserDetails(user.$id);
        setUserDetails(details);
      }
    };
    fetchDetails();
  }, [user]);

  const handleProceedToCheckout = () => {
    if (userDetails && typeof userDetails.ratanaCash === 'number' && (userDetails.ratanaCash ?? 0) > 0) {
      setShowRatanaCashModal(true);
    } else {
      ProceedToCheckout();
    }
  };

  const confirmRatanaCashUsage = async (useCash: boolean) => {
    setShowRatanaCashModal(false);
    setUseRatanaCash(useCash);
    if (useCash && userDetails) {
      // Calculate how much Ratana Cash can be used
      const total = adjustedTotal !== null ? adjustedTotal : totalAmount;
      const cashToUse = Math.min(userDetails.ratanaCash ?? 0, total);
      setRatanaCashToUse(cashToUse);
      setFinalTotal(total - cashToUse);
      await ProceedToCheckout(true, cashToUse, total - cashToUse);
    } else {
      setRatanaCashToUse(0);
      setFinalTotal(null);
      await ProceedToCheckout(false, 0, null);
    }
  };

  const ProceedToCheckout = async (usingRatanaCash = false, cashUsed = 0, newTotal: number | null = null) => {
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    try {
      const deliveryAddress = await fetchUserAddress(user!.$id.toString());
      const orderTotal = newTotal !== null ? newTotal : (adjustedTotal !== null ? adjustedTotal : totalAmount);
      const orderId = await createOrder(user!.$id.toString(), cartItems, orderTotal, deliveryAddress);
      // If using Ratana Cash, update the user's balance
      if (usingRatanaCash && userDetails) {
        await updateUserRatanaCash(userDetails.userId, (userDetails.ratanaCash ?? 0) - cashUsed);
      }
      await clearCart(user!.$id.toString());
      setCartItems([]);
      setTotalAmount(0);
      setAdjustedTotal(null);
      setFinalTotal(null);
      setRatanaCashToUse(0);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Order placed successfully!`,
      });
      router.push("/orders");
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to place the order. Please try again.',
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const renderHeader = () => (
    <View className="p-4 border-b mt-2 border-gray-200 shadow-sm bg-white">
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold ml-4" children="Shopping Cart" />
        {cartItems.length > 0 && (
          <View className="ml-auto">
            <TouchableOpacity onPress={handleClearCart}>
              <Text className="text-red-500 text-sm" children="Clear All" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} className="flex-1">
        {renderHeader()}

        <View className="flex-1">
          <ScrollView 
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3B82F6']}
                tintColor="#3B82F6"
              />
            }
            contentContainerStyle={{ paddingBottom: cartItems.length > 0 ? 120 : 20 }}
          >
            {cartItems.length === 0 ? (
              // Empty Cart View
              <View className="flex-1 items-center justify-center p-4 mt-20">
                <Ionicons name="cart-outline" size={80} color="#CBD5E0" />
                <Text className="text-xl font-bold mt-4 text-gray-700" children="Your cart is empty" />
                <Text className="text-gray-500 text-center mt-2 mb-6" children="Looks like you haven't added anything to your cart yet" />
                <Button 
                  onPress={() => router.push('/home')} 
                  className="bg-orange-500 px-8"
                  children={<Text className="text-white" children="Start Shopping" />}
                />
              </View>
            ) : (
              // Cart Items View
              <>
                {cartItems.map(item => (
                  <CartItemCard
                    key={item.productId}
                    item={item}
                    onUpdateQuantity={handleQuantityChange}
                    onRemoveItem={handleRemoveItem}
                    onQuantityPress={(productId, currentQuantity) => {
                      setQuantityModal({
                        visible: true,
                        productId,
                        currentQuantity
                      });
                    }}
                  />
                ))}
              </>
            )}
          </ScrollView>

          {/* Fixed Bottom Checkout Section */}
          {cartItems.length > 0 && (
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-600 text-base" children="Subtotal" />
                <Text className="font-bold text-lg" children={`₹${totalAmount.toFixed(2)}`} />
              </View>
              {adjustedTotal !== null && adjustedTotal !== totalAmount && (
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-600 text-base">Final Total</Text>
                  <Text className="font-bold text-lg text-green-600">₹{adjustedTotal.toFixed(2)}</Text>
                </View>
              )}
              {ratanaCashToUse > 0 && (
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-600 text-base">Ratana Cash Used</Text>
                  <Text className="font-bold text-lg text-green-600">-₹{ratanaCashToUse}</Text>
                </View>
              )}
              {finalTotal !== null && (
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-600 text-base">Total After Ratana Cash</Text>
                  <Text className="font-bold text-lg text-green-600">₹{finalTotal.toFixed(2)}</Text>
                </View>
              )}
              <Button
                onPress={handleProceedToCheckout}
                className="bg-orange-500 py-4"
                disabled={checkoutLoading}
                children={
                  <View className="flex-row items-center justify-center">
                    {checkoutLoading && <ActivityIndicator size="small" color="white" className="mr-2" />}
                    <Text className="text-white font-semibold text-lg" 
                          children={checkoutLoading ? 'Processing...' : 'Proceed to Checkout'} />
                  </View>
                }
              />
            </View>
          )}
        </View>

        <QuantityModal
          visible={quantityModal.visible}
          currentQuantity={quantityModal.currentQuantity}
          onClose={() => setQuantityModal(prev => ({ ...prev, visible: false }))}
          onConfirm={handleQuantityModalConfirm}
        />

        {showRatanaCashModal && (
          <Modal visible transparent animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-white p-6 rounded-lg mx-4 w-80">
                <Text className="text-lg font-bold mb-4">Use Ratana Cash?</Text>
                <Text className="mb-4">You have {userDetails?.ratanaCash ?? 0} Ratana Cash. Do you want to use it for this order?</Text>
                <View className="flex-row justify-end gap-3">
                  <TouchableOpacity onPress={() => confirmRatanaCashUsage(false)} className="px-4 py-2">
                    <Text className="text-gray-600">No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmRatanaCashUsage(true)} className="bg-orange-500 px-6 py-2 rounded-lg">
                    <Text className="text-white font-medium">Yes, Use It</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        <Toast />
      </LinearGradient>
    </SafeAreaView>
  );
};

const CartItemCard: React.FC<CartItemCardProps & { 
  onQuantityPress: (productId: string, currentQuantity: number) => void 
}> = React.memo(({ item, onUpdateQuantity, onRemoveItem, onQuantityPress }) => (
  <View className="mx-4 my-2 bg-white rounded-lg shadow-sm border border-gray-100">
    <TouchableOpacity onPress={() => router.push(`/product/${item.productId}`)}>
      <View className="p-4">
        <View className="flex-row">
          <Image 
                        source={{ uri: item.imageUrl }} 
                        className="w-20 h-20 rounded-lg bg-gray-100"
                        resizeMode="cover"
                      />
                      <View className="flex-1 ml-4">
                        <Text className="font-medium text-base text-gray-900" children={item.name} numberOfLines={2} />
                        <Text className="text-green-600 font-semibold mt-1" children={`₹${item.price}`} />
                        <Text className="text-gray-500 text-sm mt-1" children={`Total: ₹${(item.price * item.quantity).toFixed(2)}`} />
                      </View>
                    </View>
            
                    {/* Quantity Controls and Remove Button */}
                    <View className="flex-row items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <View className="flex-row items-center bg-gray-50 rounded-lg p-1">
                        <TouchableOpacity
                          onPress={() => onUpdateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                          className="w-8 h-8 bg-white rounded-md items-center justify-center shadow-sm"
                          activeOpacity={0.7}
                        >
                          <Ionicons name="remove" size={16} color="#374151" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          onPress={() => onQuantityPress(item.productId, item.quantity)}
                          className="mx-4 px-2 py-1"
                          activeOpacity={0.7}
                        >
                          <Text className="font-semibold text-base text-gray-900" children={item.quantity.toString()} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          onPress={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 bg-white rounded-md items-center justify-center shadow-sm"
                          activeOpacity={0.7}
                        >
                          <Ionicons name="add" size={16} color="#374151" />
                        </TouchableOpacity>
                      </View>
            
                      {/* Remove Button */}
                      <TouchableOpacity
                        onPress={() => onRemoveItem(item.productId)}
                        className="p-2"
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  </TouchableOpacity>
              </View>
            )
          );
            
export default CartScreen;