import React from 'react';
import { TouchableOpacity, View, Image } from 'react-native';
import { Text } from '../ui/Text';

interface ProductCardProps {
  image: { uri: string };
  name: string;
  price: string;
  mrp?: string;
  discount?: string;
  weight?: string;
  large?: boolean;
  onPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  image, 
  name, 
  price, 
  mrp, 
  discount, 
  weight, 
  large,
  onPress 
}) => (
  <TouchableOpacity 
    className={`${large ? 'w-64' : 'w-32'} mr-4 bg-white rounded-lg p-2`}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <Image 
      source={image} 
      className="w-full h-32 rounded-lg"
      resizeMode="cover"
    />
    <View className="p-2">
      <Text className="font-bold mt-2" numberOfLines={2} children={name} />
      {weight && <Text className="text-gray-500 text-sm" children={weight} />}
      <View className="flex-row items-center mt-1">
        <Text className="font-bold text-lg" children={price} />
        {mrp && (
          <Text className="text-gray-500 line-through ml-2 text-sm" children={mrp} />
        )}
      </View>
    </View>
    {discount && (
      <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded">
        <Text className="text-white text-xs" children={discount} />
      </View>
    )}
  </TouchableOpacity>
);