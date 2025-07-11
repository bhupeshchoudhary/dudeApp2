// lib/appwrite.ts
import {
    Account,
    Avatars,
    Client,
    Databases,
    ID,
    Query,
    Storage,
  } from "react-native-appwrite";


  
export const appwriteConfig = {
    endpoint: "https://cloud.appwrite.io/v1",
    platform: "com.dude",
    projectId: "6780e3ff00052183da93",
    databaseId: "67811767003984166d8d",
    userCollectionId: "678117b5003d84901e25",
    productscollectionId: "67841fbe001f1492ed9b",
    addressesCollectionId: "678425cb00065ae8f6e4",
    categoriesCollectionId: "6784211500075796cdb3",
    orderItemsCollectionId: "6784253f003cb6ca9b36",
    ordersCollectionId: "678422cc000435240434",
    reviewsCollectionId: "67842677000e2ff86cd8",
    topCategoriesCollectionId: "6784f04b001d5ad03d85",
    productOfTheDayCollectionId: "67a052e00031d601a6b5",
    cartsCollectionId: "6787910e000842462c22",
    pincodesCollectionId: "pincodes",
    priceMultipliersCollectionId: "priceMultipliers",
};

// Initialize the client
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

// Create instances after client initialization
export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
