// components/AddressFormModal.tsx
import React from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  ActivityIndicator 
} from 'react-native';
import { Text } from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';

interface AddressFormModalProps {
  visible: boolean;
  onClose: () => void;
  formData: AddressFormData;
  setFormData: (data: AddressFormData) => void;
  onSubmit: () => void;
  isEditing: boolean;
  isLocationLoading: boolean;
  onDetectLocation: () => void;
}

export interface AddressFormData {
  type: 'home' | 'work' | 'other';
  name: string;
  phoneNumber: string;
  address: string;
  landmark: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  visible,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isEditing,
  isLocationLoading,
  onDetectLocation,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 justify-end">
        <ScrollView className="bg-white rounded-t-xl p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold">
              {isEditing ? 'Edit Address' : 'Add New Address'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Address Type Selection */}
          <View className="mb-4">
            <Text className="font-medium mb-2">Address Type</Text>
            <View className="flex-row">
              {(['home', 'work', 'other'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setFormData({ ...formData, type })}
                  className={`flex-1 p-3 rounded-lg mr-2 ${
                    formData.type === type ? 'bg-orange-500' : 'bg-gray-100'
                  }`}
                >
                  <Text className={`text-center ${
                    formData.type === type ? 'text-white' : 'text-gray-600'
                  }`}>
                    {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Details */}
          <View className="mb-4">
            <Text className="font-medium mb-2">Contact Details</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3 mb-2"
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              className="border border-gray-200 rounded-lg p-3"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Address Details */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-medium">Address Details</Text>
              <TouchableOpacity 
                onPress={onDetectLocation}
                className="flex-row items-center"
                disabled={isLocationLoading}
              >
                {isLocationLoading ? (
                  <ActivityIndicator size="small" color="#22C55E" />
                ) : (
                  <>
                    <Ionicons name="location" size={20} color="#22C55E" />
                    <Text className="text-green-500 ml-1">Use Current Location</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TextInput
              className="border border-gray-200 rounded-lg p-3 mb-2"
              placeholder="House/Flat No., Building, Street"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              multiline
            />

            <TextInput
              className="border border-gray-200 rounded-lg p-3 mb-2"
              placeholder="Landmark (Optional)"
              value={formData.landmark}
              onChangeText={(text) => setFormData({ ...formData, landmark: text })}
            />

            <TextInput
              className="border border-gray-200 rounded-lg p-3 mb-2"
              placeholder="Area/Locality"
              value={formData.area}
              onChangeText={(text) => setFormData({ ...formData, area: text })}
            />

            <View className="flex-row mb-2">
              <TextInput
                className="flex-1 border border-gray-200 rounded-lg p-3 mr-2"
                placeholder="City"
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />
              <TextInput
                className="flex-1 border border-gray-200 rounded-lg p-3"
                placeholder="State"
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text })}
              />
            </View>

            <TextInput
              className="border border-gray-200 rounded-lg p-3"
              placeholder="Pincode"
              value={formData.pincode}
              onChangeText={(text) => setFormData({ ...formData, pincode: text })}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <TouchableOpacity
            className="bg-orange-500 p-4 rounded-lg"
            onPress={onSubmit}
          >
            <Text className="text-white text-center font-semibold">
              {isEditing ? 'Save Changes' : 'Add Address'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};