import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './ui/Text';
import { useNotifications } from '../context/NotificationProvider';
import { router } from 'expo-router';

interface NotificationBellProps {
  size?: number;
  color?: string;
  showBadge?: boolean;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  size = 24, 
  color = '#ffffff',
  showBadge = true 
}) => {
  const { unreadCount } = useNotifications();

  const handlePress = () => {
    router.push('/notifications');
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      className="relative"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons 
        name="notifications-outline" 
        size={size} 
        color={color} 
      />
      
      {showBadge && unreadCount > 0 && (
        <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
          <Text className="text-white text-xs font-bold">
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationBell; 