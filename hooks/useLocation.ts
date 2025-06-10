// hooks/useLocation.ts
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform, Linking } from 'react-native';

export interface DetailedAddress {
  area: string;
  city: string;
  street?: string | undefined;
  landmark?: string | undefined;
  postalCode?: string | undefined;
  region?: string | undefined;
  fullAddress: string;
}

interface LocationState {
  location: Location.LocationObject | null;
  address: DetailedAddress | null;
  loading: boolean;
  error: string | null;
}

const RETRY_DELAY = 1000; // 1 second between retries
const MAX_RETRIES = 10; // Increased max retries

export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    address: null,
    loading: true,
    error: null,
  });

  const checkLocationServices = async () => {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      Alert.alert(
        "Location Services Disabled",
        "Please enable location services to use this app.",
        [
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
      return false;
    }
    return true;
  };

  const getLocation = async (retryCount = 0) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Check if location services are enabled
      const servicesEnabled = await checkLocationServices();
      if (!servicesEnabled) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Location services are disabled'
        }));
        // Retry after delay even if services are disabled
        setTimeout(() => getLocation(retryCount + 1), RETRY_DELAY);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Location permission denied'
        }));
        // Retry after delay even if permission is denied
        setTimeout(() => getLocation(retryCount + 1), RETRY_DELAY);
        return;
      }

      // Try to get location with high accuracy first
      let location;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
      } catch (error) {
        // If high accuracy fails, try with balanced accuracy
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      const [addressDetails] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (!addressDetails) {
        throw new Error('Could not fetch address details');
      }

      const address: DetailedAddress = {
        area: addressDetails.district || addressDetails.subregion || 'Unknown Area',
        city: addressDetails.city || 'Unknown City',
        street: addressDetails.street || undefined,
        landmark: addressDetails.name || undefined,
        postalCode: addressDetails.postalCode || undefined,
        region: addressDetails.region || undefined,
        fullAddress: [
          addressDetails.street,
          addressDetails.district,
          addressDetails.city,
          addressDetails.region,
          addressDetails.postalCode
        ].filter(Boolean).join(', ') || 'Address not available'
      };

      setState({
        location,
        address,
        loading: false,
        error: null
      });

    } catch (error) {
      console.log(`Location fetch attempt ${retryCount + 1} failed:`, error);
      
      // Always retry unless we've hit the max retries
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          getLocation(retryCount + 1);
        }, RETRY_DELAY);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Error getting location'
        }));
        // Even after max retries, try one more time after a longer delay
        setTimeout(() => getLocation(0), RETRY_DELAY * 5);
      }
    }
  };

  // Start location fetching immediately
  useEffect(() => {
    getLocation();
  }, []);

  return {
    ...state,
    getLocation: () => getLocation(0), // Reset retry count when manually called
  };
};