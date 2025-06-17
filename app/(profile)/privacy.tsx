// app/(profile)/privacy.tsx
import React from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Text } from '../../components/ui/Text';
import { Ionicons } from '@expo/vector-icons';

interface PrivacyOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

export default function PrivacyScreen() {
  const [privacyOptions, setPrivacyOptions] = React.useState<PrivacyOption[]>([
    {
      id: 'location',
      title: 'Location Services',
      description: 'Allow app to access your location',
      enabled: true,
      onToggle: () => toggleOption('location'),
    },
    // {
    //   id: 'notifications',
    //   title: 'Push Notifications',
    //   description: 'Receive updates and offers',
    //   enabled: true,
    //   onToggle: () => toggleOption('notifications'),
    // },
    // {
    //   id: 'analytics',
    //   title: 'Analytics',
    //   description: 'Help us improve by sharing usage data',
    //   enabled: false,
    //   onToggle: () => toggleOption('analytics'),
    // },
  ]);

  const toggleOption = (id: string) => {
    setPrivacyOptions(prev =>
      prev.map(option =>
        option.id === id
          ? { ...option, enabled: !option.enabled }
          : option
      )
    );
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {privacyOptions.map(option => (
        <View
          key={option.id}
          className="p-4 border-b border-gray-100"
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="font-bold text-lg">{option.title}</Text>
              <Text className="text-gray-500 mt-1">{option.description}</Text>
            </View>
            <TouchableOpacity
              onPress={option.onToggle}
              className={`w-12 h-6 rounded-full ${
                option.enabled ? 'bg-[#E86A2B]' : 'bg-[#EBA05C]'
              } justify-center`}
            >
              <View
                className={`w-5 h-5 rounded-full bg-white shadow absolute ${
                  option.enabled ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View className="p-4">
        <Text className="text-sm text-gray-500">
          Your privacy is important to us. We only collect and use information in accordance
          with our privacy policy. You can control what data you share with us using the
          options above.
        </Text>
      </View>
    </ScrollView>
  );
}