import React, { useState, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { Text } from '../../components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../../context/GlobalProvider';
import { databases } from '../../lib/appwrite';
import { Query } from "react-native-appwrite";
import { appwriteConfig } from '../../lib/appwrite';
import Toast from 'react-native-toast-message';

// Types
interface UserAddress {
  name: string; // Full name
  phone: string; // Phone number
  address: string; // User's address
  shopName: string; // Name of the shop
  pincode: string; // Pincode
}

export default function AddressesScreen() {
  const { user } = useGlobalContext();
  const [userAddress, setUserAddress] = useState<UserAddress | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserAddress>({
    name: '',
    phone: '',
    address: '',
    shopName: '',
    pincode: '',
  });

  useEffect(() => {
    loadUserAddress();
  }, []);

  const loadUserAddress = async () => {
    setIsLoading(true);
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal('userId', user?.$id || '')]
      );

      if (response.documents.length > 0) {
        const userData = response.documents[0];
        setUserAddress({
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          shopName: userData.shopName,
          pincode: userData.pincode,
        });
      }
    } catch (error) {
      console.log("Error loading user address:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load address details',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your full name',
      });
      return false;
    }
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid 10-digit phone number',
      });
      return false;
    }
    if (!formData.address.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your address',
      });
      return false;
    }
    if (!formData.shopName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your shop name',
      });
      return false;
    }
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid 6-digit pincode',
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    try {
      // First get the document that matches the user ID
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal('userId', user?.$id || '')]
      );
  
      if (response.documents.length > 0) {
        // Get the document ID of the first matching document
        const documentId = response.documents[0].$id;
  
        // Now update the document using its ID
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          documentId,  // Use the actual document ID here
          formData
        );
  
        await loadUserAddress();
        setIsModalVisible(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Address updated successfully',
        });
      }
    } catch (error) {
      console.log("Error updating address:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update address',
      });
    }
  };

  const handleEditAddress = () => {
    if (userAddress) {
      setFormData(userAddress);
      setIsModalVisible(true);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22C55E" />
        </View>
      ) : (
        <ScrollView>
          {userAddress ? (
            <View className="bg-white p-4 rounded-lg shadow-sm">
              <Text className="text-xl font-bold mb-4">Address Details</Text>
              <View className="space-y-2">
                <Text className="text-gray-600">Name: {userAddress.name}</Text>
                <Text className="text-gray-600">Phone: {userAddress.phone}</Text>
                <Text className="text-gray-600">Address: {userAddress.address}</Text>
                <Text className="text-gray-600">Shop Name: {userAddress.shopName}</Text>
                <Text className="text-gray-600">Pincode: {userAddress.pincode}</Text>
              </View>

              <TouchableOpacity
                className="bg-orange-500 mt-4 p-2 rounded-lg flex-row justify-center items-center"
                onPress={handleEditAddress}
              >
                <Ionicons name="pencil" size={20} color="white" />
                <Text className="text-white ml-2 font-medium">Edit Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="p-4 items-center">
              <Text className="text-gray-500">No address details found</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal for Editing Address */}
      {isModalVisible && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-white p-4 rounded-lg w-11/12">
            <Text className="text-xl font-bold mb-4">Edit Address</Text>

            <View className="space-y-4">
              <TextInput
                className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-200"
                placeholder="Full Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              <TextInput
                className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-200"
                placeholder="Phone Number"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-200"
                placeholder="Address"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
              />
              <TextInput
                className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-200"
                placeholder="Shop Name"
                value={formData.shopName}
                onChangeText={(text) => setFormData({ ...formData, shopName: text })}
              />
              <TextInput
                className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-200"
                placeholder="Pincode"
                value={formData.pincode}
                onChangeText={(text) => setFormData({ ...formData, pincode: text })}
                keyboardType="numeric"
              />
            </View>

            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                className="bg-gray-300 px-4 py-2 rounded-lg mr-2"
                onPress={() => setIsModalVisible(false)}
              >
                <Text className="text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-orange-500 px-4 py-2 rounded-lg"
                onPress={handleSubmit}
              >
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <Toast />
    </View>
  );
}