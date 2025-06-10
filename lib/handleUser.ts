// lib/handleUser.ts
import { databases } from './appwrite';
import { ID, Query } from "react-native-appwrite";
import { appwriteConfig } from './appwrite';
import { User } from '../types/userTypes';
import { DeliveryAddress } from '../types/OrderTypes';
export const fetchUserDetails = async (id: string): Promise<User> => {
    // console.log("this is id in fetchUser function:", id);
    
    try {
        const user = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('userId', id)] // Changed from 'userId' to match the field in the database
        );

        // console.log("Raw user response from Appwrite:", user);

        // Ensure userData exists
        if (!user.documents || user.documents.length === 0) {
            throw new Error("No user found for the given ID");
        }

        const userData = user.documents[0]; 
        // console.log("this is userData:", userData);

     

        return {
            userId: userData.userId,
            email: userData.email,
            name: userData.name ?? '',
            phone: userData.phone ?? '',
            retailCode: userData.retailCode ?? '',
            address: userData.address ?? '',
            shopName: userData.shopName ?? '',
            password: userData.password ?? '',
            pincode: userData.pincode ?? '',
            profileUrl: userData.profileUrl ?? '',
            createdAt: userData.$createdAt,
            updatedAt: userData.$updatedAt,
        };
    } catch (error) {
        console.error("Error in fetchUserDetails:", error);
        throw new Error(error instanceof Error ? error.message : String(error));
    }
};



export const fetchUserAddress = async (id: string): Promise<DeliveryAddress> => {
    try {
        const user = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('userId', id)]
        );

        if (!user.documents || user.documents.length === 0) {
            throw new Error("No user found for the given ID");
        }

        const userData = user.documents[0];

        return {
            name: userData.name ?? '',
            phone: userData.phone ?? '',
            address: userData.address ?? '',
            pincode: userData.pincode ?? '',
        };
    } catch (error) {
        console.error("Error in fetchUserAddress:", error);
        throw new Error(error instanceof Error ? error.message : String(error));
    }
};
