import { databases, appwriteConfig } from './appwrite';
import { ID, Query } from 'react-native-appwrite';
import { Location } from '../types/locationTypes';

// Fetch all locations
export const fetchLocations = async (): Promise<Location[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.locationsCollectionId
    );
    return response.documents as Location[];
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw new Error('Failed to fetch locations');
  }
};

// Fetch location by pincode
export const fetchLocationByPincode = async (pincode: string): Promise<Location | null> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.locationsCollectionId,
      [Query.equal('pincode', pincode)]
    );
    return response.documents[0] as Location || null;
  } catch (error) {
    console.error('Error fetching location:', error);
    throw new Error('Failed to fetch location');
  }
};

// Calculate adjusted price based on location
export const calculateAdjustedPrice = (originalPrice: number, priceMultiplier: number): number => {
  return Math.round(originalPrice * priceMultiplier);
};

// Check if pincode is serviceable
export const isPincodeServiceable = async (pincode: string): Promise<boolean> => {
  try {
    const location = await fetchLocationByPincode(pincode);
    return location?.isServiceable || false;
  } catch (error) {
    console.error('Error checking serviceability:', error);
    return false;
  }
}; 