import React, { useState, useCallback } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { Text } from '../../components/ui/Text';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserOrders } from '../../lib/handleOrder';
import { useGlobalContext } from '@/context/GlobalProvider';
import { useFocusEffect } from '@react-navigation/native';
import { Order } from '../../types/OrderTypes';

export default function OrdersScreen() {
  const { user } = useGlobalContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserOrdersInfo = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const result = await fetchUserOrders(user.$id.toString());
      setOrders(result);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUserOrdersInfo();
    } catch (error) {
      console.error('Error refreshing orders:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchUserOrdersInfo]);

  useFocusEffect(
    useCallback(() => {
      fetchUserOrdersInfo();
    }, [fetchUserOrdersInfo])
  );

  const renderOrder = ({ item }: { item: Order }) => (
    <View className="bg-white m-2 p-4 rounded-lg shadow-sm mt-10">
      {/* Order ID and Date */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-gray-600 text-sm" children={`Order #${item.$id.slice(-6)}`} />
        <Text className="text-gray-500 text-xs" children={new Date(item.createdAt).toLocaleDateString()} />
      </View>

      {/* Order Status and Amount */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <View 
            className={`w-2 h-2 rounded-full mr-2 ${
              item.status === 'delivered' ? 'bg-green-500' : 
              item.status === 'pending' ? 'bg-yellow-500' : 
              'bg-blue-500'
            }`} 
          />
          <Text className="capitalize" children={item.status} />
        </View>
        <Text className="font-bold" children={`₹${item.totalAmount}`} />
      </View>

      {/* Items Summary */}
      <View className="mb-3">
        {item.items.map((product, index) => (
          <View key={product.productId} className="flex-row justify-between py-1">
            <Text className="text-gray-600" children={`${product.quantity}x ${product.name}`} />
            <Text className="text-gray-600" children={`₹${product.price}`} />
          </View>
        ))}
      </View>

      {/* Delivery Address */}
      <View className="border-t border-gray-200 pt-2">
        <Text className="text-gray-600 text-sm" children={`Delivering to: ${item.deliveryAddress.name}`} />
        <Text className="text-gray-500 text-xs" children={`${item.deliveryAddress.address}, ${item.deliveryAddress.pincode}`} />
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500" children="Loading orders..." />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="basket-outline" size={64} color="#9CA3AF" />
          <Text className="text-gray-500 mt-4" children="No orders found" />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.$id}
          contentContainerClassName="pb-4"
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#22C55E']}
              tintColor="#22C55E"
            />
          }
        />
      )}
    </View>
  );
}