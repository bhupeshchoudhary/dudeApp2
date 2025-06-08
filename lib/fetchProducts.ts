import { databases } from "./appwrite";
import {
    Account,
    Avatars,
    Client,
    Databases,
    ID,
    Query,
    Storage,
    AppwriteException,
  } from "react-native-appwrite";
import {appwriteConfig} from "./appwrite";
import { Product } from "../types/productTypes";
import { Category } from "../types/categoryTypes";

// Helper function to validate ID
const isValidId = (id: string): boolean => {
  return typeof id === 'string' && id.trim().length > 0;
};

// Helper function to transform document to Product
const transformToProduct = (doc: any): Product => ({
  $collectionId: doc.$collectionId,
  $createdAt: doc.$createdAt,
  $databaseId: doc.$databaseId,
  $id: doc.$id,
  $permissions: doc.$permissions,
  $updatedAt: doc.$updatedAt,
  categoryId: doc.categoryId,
  createdAt: doc.createdAt,
  description: doc.description,
  discount: doc.discount,
  imageUrl: doc.imageUrl,
  isFeatured: doc.isFeatured,
  mrp: doc.mrp,
  name: doc.name,
  price: doc.price,
  unit: doc.unit,
  productId: doc.productId,
  stock: doc.stock,
  updatedAt: doc.updatedAt,
});

export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productscollectionId,
      [Query.equal('isFeatured', true)]
    );

    return response.documents.map(transformToProduct);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw new Error('Failed to fetch featured products. Please try again later.');
  }
}

export async function fetchProductsById(id: string): Promise<Product | null> {
  if (!isValidId(id)) {
    throw new Error('Invalid product ID provided');
  }

  try {
    const response = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.productscollectionId,
      id.trim()
    );

    return transformToProduct(response);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    if (error instanceof AppwriteException && error.code === 404) {
      return null;
    }
    throw new Error('Failed to fetch product details. Please try again later.');
  }
}

export async function fetchProductsByCategoryId(categoryId: string): Promise<Product[]> {
  if (!isValidId(categoryId)) {
    return [];
  }

  try {
    // First get the category document to get its categoryId
    const categoryDoc = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      categoryId.trim()
    );

    if (!categoryDoc) {
      return [];
    }

    // Then fetch products using the categoryId from the category document
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productscollectionId,
      [Query.equal('categoryId', categoryDoc.categoryId)]
    );

    return response.documents.map(transformToProduct);
  } catch (error) {
    // Silently handle all errors
    return [];
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      [Query.limit(100)]
    );

    return response.documents.map((doc) => ({
      $id: doc.$id,
      name: doc.name,
      imageUrl: doc.imageUrl,
      categoryId: doc.categoryId
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories. Please try again later.');
  }
}

export async function fetchTopCategories(): Promise<Category[]> {
  try {
    const topCategoriesResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.topCategoriesCollectionId,
      [Query.orderAsc('rank'), Query.limit(10)]
    );

    const categories = await Promise.all(
      topCategoriesResponse.documents.map(async (doc) => {
        if (!isValidId(doc.categoryDocumentId)) {
          console.warn('Invalid category document ID found:', doc.categoryDocumentId);
          return null;
        }

        try {
          const category = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
            doc.categoryDocumentId.trim()
          );

          if (!category) {
            console.warn('Category not found:', doc.categoryDocumentId);
            return null;
          }

          return {
            $id: category.$id,
            name: category.name,
            imageUrl: category.imageUrl,
            categoryId: category.categoryId,
          };
        } catch (error) {
          if (error instanceof AppwriteException && error.code === 404) {
            console.warn('Category not found:', doc.categoryDocumentId);
            return null;
          }
          console.error('Error fetching category details:', error);
          return null;
        }
      })
    );

    // Filter out null values and return only valid categories
    const validCategories = categories.filter((category): category is Category => category !== null);
    
    // If no valid categories found, return empty array
    if (validCategories.length === 0) {
      console.warn('No valid categories found in top categories');
      return [];
    }

    return validCategories;
  } catch (error) {
    console.error('Error fetching top categories:', error);
    return []; // Return empty array instead of throwing error
  }
}

// export async function fetchProductOfTheDay():Promise<Product[]>{
//   return 
// }