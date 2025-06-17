// components/LocationExpandedView.tsx
import React from 'react';
import { View, Modal, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { Text } from './ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { DetailedAddress } from '../hooks/useLocation';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

const { width } = Dimensions.get('window');

interface LocationExpandedViewProps {
  visible: boolean;
  onClose: () => void;
  address: DetailedAddress | null;
  loading: boolean;
  error: string | null;
  onRefreshLocation: () => void;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export const LocationExpandedView: React.FC<LocationExpandedViewProps> = ({
  visible,
  onClose,
  address,
  loading,
  error,
  onRefreshLocation,
  coordinates
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50">
        <View className="mt-auto bg-white rounded-t-3xl h-[85%]">
          {/* Header */}
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold" children="Delivery Location" />
              <TouchableOpacity 
                onPress={onClose}
                className="p-2"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1" bounces={false}>
            {/* Map View */}
            {coordinates && (
              <View className="w-full h-48">
                <MapView
                  provider={PROVIDER_DEFAULT}
                  style={{
                    width: width,
                    height: 200,
                  }}
                  initialRegion={{
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  showsUserLocation={true}
                  showsMyLocationButton={true}
                  followsUserLocation={true}
                  showsCompass={true}
                  scrollEnabled={true}
                  zoomEnabled={true}
                  rotateEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: coordinates.latitude,
                      longitude: coordinates.longitude,
                    }}
                  >
                    <View className="items-center">
                      <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center shadow-sm">
                        <Ionicons name="location" size={20} color="white" />
                      </View>
                      <View className="absolute -bottom-3 w-2 h-2 bg-orange-500 rotate-45 shadow-sm" />
                    </View>
                  </Marker>
                </MapView>
                
                {/* Refresh Button */}
                <TouchableOpacity 
                  className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg"
                  onPress={onRefreshLocation}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="refresh" size={24} color="#22C55E" />
                </TouchableOpacity>

                {/* Location Accuracy Indicator */}
                {Platform.OS === 'ios' && (
                  <View className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow-sm flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                    <Text className="text-xs text-gray-600" children="GPS Active" />
                  </View>
                )}
              </View>
            )}

            {/* Current Location Section */}
            <View className="p-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                  <Ionicons name="location" size={24} color="#22C55E" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-lg" children="Current Location" />
                  {loading ? (
                    <Text className="text-gray-500" children="Getting your location..." />
                  ) : error ? (
                    <Text className="text-red-500" children={error} />
                  ) : address ? (
                    <Text className="text-gray-500" numberOfLines={2} children={address.fullAddress} />
                  ) : null}
                </View>
              </View>

              {/* Detailed Address */}
              {!loading && !error && address && (
                <View className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <AddressDetail 
                    icon="location"
                    label="Area"
                    value={address.area}
                  />
                  {address.street && (
                    <AddressDetail 
                      icon="map"
                      label="Street"
                      value={address.street}
                    />
                  )}
                  {address.landmark && (
                    <AddressDetail 
                      icon="navigate"
                      label="Landmark"
                      value={address.landmark}
                    />
                  )}
                  <AddressDetail 
                    icon="business"
                    label="City"
                    value={address.city}
                  />
                  {address.postalCode && (
                    <AddressDetail 
                      icon="mail"
                      label="PIN Code"
                      value={address.postalCode}
                    />
                  )}
                </View>
              )}
            </View>

            {/* Confirm Location Button */}
            <View className="p-4 border-t border-gray-200">
              <TouchableOpacity 
                className="w-full bg-orange-500 py-3 rounded-lg"
                onPress={() => {
                  // Handle location confirmation
                  onClose();
                }}
              >
                <Text className="text-white text-center font-semibold" children="Confirm Location" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

interface AddressDetailProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

const AddressDetail: React.FC<AddressDetailProps> = ({ icon, label, value }) => (
  <View className="flex-row items-center mb-3 last:mb-0">
    <Ionicons name={icon} size={20} color="gray" />
    <View className="ml-3 flex-1">
      <Text className="text-gray-500 text-sm" children={label} />
      <Text className="font-medium" numberOfLines={1} children={value} />
    </View>
  </View>
);

export default LocationExpandedView;