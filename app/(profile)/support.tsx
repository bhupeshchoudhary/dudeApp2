// app/(profile)/support.tsx
import React from 'react';
import { View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Text } from '../../components/ui/Text';
import { Ionicons } from '@expo/vector-icons';

interface SupportOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  action: () => void;
}

export default function SupportScreen() {
  const supportOptions: SupportOption[] = [
    {
      id: 'call',
      icon: 'call',
      title: 'Call Us',
      description: 'Talk to our customer support',
      action: () => Linking.openURL('tel:+919116045123'),
    },
    {
      id: 'whatsapp',
      icon: 'logo-whatsapp',
      title: 'WhatsApp',
      description: 'Chat with us on WhatsApp',
      action: () => Linking.openURL('whatsapp://send?phone=9116045123'),
    },
    {
      id: 'email',
      icon: 'mail',
      title: 'Email',
      description: 'Send us an email',
      action: () => Linking.openURL('mailto:padmavtimarketing5554@gmail.com'),
    },
    // {
    //   id: 'faq',
    //   icon: 'help-circle',
    //   title: 'FAQs',
    //   description: 'Frequently asked questions',
    //   action: () => console.log('Navigate to FAQs'),
    // },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {supportOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            className="bg-white p-4 rounded-lg mb-4 flex-row items-center"
            onPress={option.action}
          >
            <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
              <Ionicons name={option.icon} size={24} color="#22C55E" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-bold">{option.title}</Text>
              <Text className="text-gray-500">{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}