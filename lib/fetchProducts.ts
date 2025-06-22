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
  discount: doc.discount, // Keep discount as is (it's already a percentage)
  imageUrl: doc.imageUrl,
  isFeatured: doc.isFeatured,
  mrp: doc.mrp ? doc.mrp / 100 : null, // Convert from cents to rupees
  name: doc.name,
  price: doc.price / 100, // Convert from cents to rupees
  unit: doc.unit,
  productId: doc.productId,
  stock: doc.stock,
  updatedAt: doc.updatedAt,
});

// Enhanced function to fetch all products with pagination
export async function fetchAllProductsWithPagination(limit: number = 100): Promise<Product[]> {
  try {
    let allProducts: Product[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.productscollectionId,
        [
          Query.limit(limit),
          Query.offset(offset),
          Query.orderDesc('$createdAt') // Order by creation date
        ]
      );

      const products = response.documents.map(transformToProduct);
      allProducts = [...allProducts, ...products];

      // Check if we have more products to fetch
      if (products.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }

      // Safety check to prevent infinite loops
      if (offset > 10000) {
        console.warn('Reached maximum pagination limit, stopping fetch');
        break;
      }
    }

    console.log(`Successfully fetched ${allProducts.length} products`);
    return allProducts;
  } catch (error) {
    console.error('Error fetching all products with pagination:', error);
    throw new Error('Failed to fetch products. Please try again later.');
  }
}

// Function to fetch related products based on the current product's category
export async function fetchRelatedProducts(currentProductId: string, limit: number = 6): Promise<Product[]> {
  try {
    console.log('Fetching related products for product ID:', currentProductId);
    
    // Get the current product to ensure we use its actual categoryId
    const currentProduct = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.productscollectionId,
      currentProductId
    );

    console.log('Current product data:', {
      id: currentProduct.$id,
      name: currentProduct.name,
      categoryId: currentProduct.categoryId
    });

    const categoryId = currentProduct.categoryId;
    if (!categoryId) {
      console.warn('No categoryId found for current product');
      return [];
    }

    console.log('Fetching products with categoryId:', categoryId);

    // Fetch other products in the same category, excluding the current product
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productscollectionId,
      [
        Query.equal('categoryId', categoryId),
        Query.notEqual('$id', currentProductId),
        Query.limit(limit),
        Query.orderDesc('$createdAt')
      ]
    );

    const relatedProducts = response.documents.map(transformToProduct);
    
    console.log('Related products found:', {
      count: relatedProducts.length,
      products: relatedProducts.map(p => ({
        id: p.$id,
        name: p.name,
        categoryId: p.categoryId,
        price: p.price
      }))
    });

    return relatedProducts;
  } catch (error) {
    console.error('Error fetching related products:', error);
    
    // If the main query fails, try a fallback approach
    try {
      console.log('Trying fallback approach for related products...');
      
      // Get all products and filter by category manually
      const allProductsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.productscollectionId,
        [
          Query.limit(50),
          Query.orderDesc('$createdAt')
        ]
      );
      
      const allProducts = allProductsResponse.documents.map(transformToProduct);
      
      // Get current product category
      const currentProduct = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.productscollectionId,
        currentProductId
      );
      
      const categoryId = currentProduct.categoryId;
      
      // Filter products by category and exclude current product
      const filteredProducts = allProducts
        .filter(product => product.categoryId === categoryId && product.$id !== currentProductId)
        .slice(0, limit);
      
      console.log('Fallback related products found:', filteredProducts.length);
      return filteredProducts;
      
    } catch (fallbackError) {
      console.error('Fallback approach also failed:', fallbackError);
      return [];
    }
  }
}

// Function to fetch products by category with pagination
export async function fetchProductsByCategoryWithPagination(categoryId: string, limit: number = 20): Promise<Product[]> {
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
      [
        Query.equal('categoryId', categoryDoc.categoryId),
        Query.limit(limit),
        Query.orderDesc('$createdAt')
      ]
    );

    return response.documents.map(transformToProduct);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productscollectionId,
      [
        Query.equal('isFeatured', true),
        Query.limit(20),
        Query.orderDesc('$createdAt')
      ]
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
    // First try to find the product by document ID
    const response = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.productscollectionId,
      id.trim()
    );

    return transformToProduct(response);
  } catch (error) {
    // If document ID not found, try to find by productId
    if (error instanceof AppwriteException && error.code === 404) {
      try {
        const products = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.productscollectionId,
          [Query.equal('productId', id.trim())]
        );

        if (products.documents.length > 0) {
          return transformToProduct(products.documents[0]);
        }
      } catch (listError) {
        console.error('Error fetching product by productId:', listError);
      }
    } else {
      console.error('Unexpected error fetching product:', error);
    }
    
    return null;
  }
}

export async function fetchProductsByCategoryId(categoryId: string): Promise<Product[]> {
  return fetchProductsByCategoryWithPagination(categoryId, 50); // Fetch more products for category pages
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      [
        Query.limit(100),
        Query.orderAsc('name')
      ]
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

// Enhanced function to fetch all products (backward compatibility)
export async function fetchProducts(): Promise<Product[]> {
  try {
    // Use pagination to fetch all products
    return await fetchAllProductsWithPagination(100);
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

// Function to search products
export async function searchProducts(query: string, limit: number = 50): Promise<Product[]> {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productscollectionId,
      [
        Query.search('name', query),
        Query.limit(limit),
        Query.orderDesc('$createdAt')
      ]
    );

    return response.documents.map(transformToProduct);
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// export async function fetchProductOfTheDay():Promise<Product[]>{
//   return 
// }

// Test function to debug related products issue
export async function testRelatedProductsFunctionality(): Promise<void> {
  try {
    console.log('=== Testing Related Products Functionality ===');
    
    // First, let's get all products to see what we have
    const allProducts = await fetchAllProductsWithPagination(10);
    console.log('Sample products:', allProducts.map(p => ({
      id: p.$id,
      name: p.name,
      categoryId: p.categoryId
    })));
    
    if (allProducts.length === 0) {
      console.log('No products found in database');
      return;
    }
    
    // Test with the first product
    const testProduct = allProducts[0];
    console.log('Testing with product:', {
      id: testProduct.$id,
      name: testProduct.name,
      categoryId: testProduct.categoryId
    });
    
    // Test related products function
    const relatedProducts = await fetchRelatedProducts(
      testProduct.$id,
      6
    );
    
    console.log('Related products found:', relatedProducts.length);
    console.log('Related products:', relatedProducts.map(p => ({
      id: p.$id,
      name: p.name,
      categoryId: p.categoryId
    })));
    
    // Test featured products as well
    const featuredProducts = await fetchFeaturedProducts();
    console.log('Featured products found:', featuredProducts.length);
    
    console.log('=== End Test ===');
  } catch (error) {
    console.error('Test failed:', error);
  }
}