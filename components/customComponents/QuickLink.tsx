import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';

interface QuickLinkProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
}

export const QuickLink: React.FC<QuickLinkProps> = ({ icon, title, onPress }) => (
  <TouchableOpacity 
    className="items-center"
    activeOpacity={0.7}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Quick link: ${title}`}
  >
    <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center">
      <Ionicons name={icon} size={24} color="#4B5563" />
    </View>
    <Text className="text-xs mt-1 text-center" children={title} />
  </TouchableOpacity>
);