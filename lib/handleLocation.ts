import { databases, appwriteConfig } from './appwrite';
import { ID, Query } from 'react-native-appwrite';
import { Location } from '../types/locationTypes';
import { Pincode, PriceMultiplier } from '../types/locationTypes';

// Fetch all locations
export const fetchLocations = async (): Promise<Location[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.pincodesCollectionId,
      [Query.equal('isActive', true)]
    );
    return response.documents.map((doc: Pincode) => ({
      $id: doc.$id,
      name: doc.area || '',
      pincode: doc.pincode || '',
      priceMultiplier: 1, // Will be fetched separately
      isServiceable: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }));
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
      appwriteConfig.pincodesCollectionId,
      [Query.equal('pincode', pincode), Query.equal('isActive', true)]
    );
    
    if (!response.documents.length) return null;
    
    const doc = response.documents[0] as Pincode;
    return {
      $id: doc.$id,
      name: doc.area || '',
      pincode: doc.pincode || '',
      priceMultiplier: 1, // Will be fetched separately
      isServiceable: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    throw new Error('Failed to fetch location');
  }
};

// Fetch serviceable pincodes from Appwrite
export const fetchServiceablePincodes = async (): Promise<string[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.pincodesCollectionId,
      [Query.equal('isActive', true)]
    );
    return response.documents
      .map((doc: Pincode) => doc.pincode)
      .filter((pincode: string) => pincode && pincode.length > 0);
  } catch (error) {
    console.error('Error fetching serviceable pincodes:', error);
    return [];
  }
};

// Fetch price multiplier for a pincode from Appwrite
export const fetchPriceMultiplierByPincode = async (pincode: string): Promise<number> => {
  try {
    // First, get the pincode document to find its $id
    const pincodeRes = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.pincodesCollectionId,
      [Query.equal('pincode', pincode), Query.equal('isActive', true)]
    );
    
    if (!pincodeRes.documents.length) return 1;
    const pincodeId = pincodeRes.documents[0].$id;
    
    // Now, get the price multiplier for this pincodeId
    const multiplierRes = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.priceMultipliersCollectionId,
      [Query.equal('pincodeId', pincodeId), Query.equal('isActive', true)]
    );
    
    if (!multiplierRes.documents.length) return 1;
    const multiplier = multiplierRes.documents[0] as PriceMultiplier;
    return multiplier.multiplierValue || 1;
  } catch (error) {
    console.error('Error fetching price multiplier:', error);
    return 1;
  }
};

// Calculate adjusted price based on location
export const calculateAdjustedPrice = (originalPrice: number, priceMultiplier: number): number => {
  return Math.round(originalPrice * priceMultiplier);
};

// Check if pincode is serviceable
export const isPincodeServiceable = async (pincode: string): Promise<boolean> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.pincodesCollectionId,
      [Query.equal('pincode', pincode), Query.equal('isActive', true)]
    );
    return response.documents.length > 0;
  } catch (error) {
    console.error('Error checking serviceability:', error);
    return false;
  }
}; 