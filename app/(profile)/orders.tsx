// app/(profile)/orders.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text } from '../../components/ui/Text';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {fetchUserOrders} from '../../lib/handleOrder';
import { useGlobalContext } from '@/context/GlobalProvider';

import { Order } from '../../types/OrderTypes';


export default function OrdersScreen() {
    const { user } = useGlobalContext();

    const [orders, setOrders] = useState<Order[]>([]);

    const fetchUserOdersINfo = async () => {

     const result = await  fetchUserOrders(user!.$id.toString());

      setOrders(result);

      console.log('Orders:', orders[0]);
    }

    useEffect(() => {
        if (user) {
          fetchUserOdersINfo();
        }
    }, [user]);


  const renderOrder = ({ item }: { item: Order }) => (
    <View className="bg-white m-2 p-4 rounded-lg shadow-sm">
    {/* Order ID and Date */}
    <View className="flex-row justify-between items-center mb-2">
      <Text className="text-gray-600 text-sm">Order #{item.$id.slice(-6)}</Text>
      <Text className="text-gray-500 text-xs">
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>

    {/* Order Status and Amount */}
    <View className="flex-row justify-between items-center mb-4">
      <View className="flex-row items-center">
        <View 
          className={`w-2 h-2 rounded-full mr-2 ${
            item.status === 'delivered' ? 'bg-orange-500' : 
            item.status === 'pending' ? 'bg-yellow-500' : 
            'bg-blue-500'
          }`} 
        />
        <Text className="capitalize">{item.status}</Text>
      </View>
      <Text className="font-bold">₹{item.totalAmount}</Text>
    </View>

    {/* Items Summary */}
    <View className="mb-3">
      {item.items.map((product, index) => (
        <View key={index} className="flex-row justify-between py-1">
          <Text className="text-gray-600">
            {product.quantity}x {product.name}
          </Text>
          <Text className="text-gray-600">₹{product.price}</Text>
        </View>
      ))}
    </View>

    {/* Delivery Address */}
    <View className="border-t border-gray-200 pt-2">
      <Text className="text-gray-600 text-sm">
        Delivering to: {item.deliveryAddress.name}
      </Text>
      <Text className="text-gray-500 text-xs">
        {item.deliveryAddress.address}, {item.deliveryAddress.pincode}
      </Text>
    </View>
  </View>
  );

  return (
<View className="flex-1 bg-gray-50">
    {orders.length === 0 ? (
      <View className="flex-1 justify-center items-center">
        <Ionicons name="basket-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 mt-4">No orders found</Text>
      </View>
    ) : (
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.$id}
        contentContainerClassName="pb-4"
        showsVerticalScrollIndicator={false}
      />
    )}
  </View>
  );
}