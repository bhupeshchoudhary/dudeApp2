import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '../ui/Text';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export const Section: React.FC<SectionProps> = ({ title, children, showViewAll, onViewAll }) => (
  <View className="mt-6">
    <View className="flex-row justify-between items-center px-4 mb-4">
      <Text className="text-lg font-bold" children={title} />
      {showViewAll && (
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={onViewAll}
          accessibilityRole="button"
          accessibilityLabel={`View all ${title}`}
        >
          <Text className="text-green-500" children="View All" />
        </TouchableOpacity>
      )}
    </View>
    {children}
  </View>
);