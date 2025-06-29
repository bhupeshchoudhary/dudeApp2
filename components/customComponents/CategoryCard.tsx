import React from 'react';
import { TouchableOpacity, View, Image } from 'react-native';
import { Text } from '../ui/Text';

interface CategoryCardProps {
  title: string;
  startingPrice?: string;
  image: { uri: string };
  onPress?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ title, startingPrice, image, onPress }) => (
  <TouchableOpacity 
    className="w-full bg-white shadow-sm border border-gray-200 overflow-hidden"
    activeOpacity={0.8}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Category: ${title}`}
  >
    <View className="relative">
      <Image 
        source={image} 
        className="w-full h-24"
        resizeMode="cover"
      />
      <View className="absolute inset-0 bg-black/10" />
    </View>
    <View className="p-3">
      <Text 
        className="font-semibold text-gray-800 text-sm text-center" 
        numberOfLines={2}
        children={title} 
      />
      {startingPrice && (
        <Text 
          className="text-orange-600 text-xs text-center mt-1 font-medium" 
          children={`From ₹${startingPrice}`} 
        />
      )}
    </View>
  </TouchableOpacity>
);