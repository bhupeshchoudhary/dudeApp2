// app/(profile)/terms.tsx
import React from 'react';
import { ScrollView } from 'react-native';
import { Text } from '../../components/ui/Text';

export default function TermsScreen() {
  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Terms & Conditions</Text>
      
      <Text className="text-lg font-bold mt-4 mb-2">1. Introduction</Text>
      <Text className="text-gray-600 mb-4">
      Ratana is the official app for retailers to place orders directly from Padmavati Marketing, a trusted wholesale FMCG distributor. With a user-friendly design and real-time order tracking, Ratana enables shop owners to browse product catalogs, check availability, place repeat orders, and track delivery status — all in one app. Secure login, reliable support, and easy reorder options make Ratana the go-to tool for smart shopkeepers.
      </Text>

      <Text className="text-lg font-bold mt-4 mb-2">2. License</Text>
      <Text className="text-gray-600 mb-4">
      Indian Legal System (Judiciary under the Constitution of India)
      Governing law: Laws of the Republic of India
      </Text>

      {/* Add more sections as needed */}
    </ScrollView>
  );
}