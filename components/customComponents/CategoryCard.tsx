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
    className="w-[48%] bg-[#F7C873] rounded-lg p-4 mb-4"
    activeOpacity={0.7}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Category: ${title}`}
  >
    <Image 
      source={image} 
      className="w-20 h-20"
      resizeMode="cover"
    />
    <View className="p-2">
      <Text className="font-bold mt-2 text-[#7C4A1E]" children={title} />
      {startingPrice && (
        <Text className="text-[#E86A2B] text-sm" children={`Starting at ${startingPrice}`} />
      )}
    </View>
  </TouchableOpacity>
);