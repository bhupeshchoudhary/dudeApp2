import { databases } from './appwrite';
import { Query } from "react-native-appwrite";
import { appwriteConfig } from './appwrite';

export const fetchProductOfTheDay = async () => {
  try {
    // Step 1: Fetch the "Product of the Day" documents
    const productsOfTheDay = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productOfTheDayCollectionId
    );

    // Log the response for debugging
    console.log("Products of the Day response:", productsOfTheDay);

    // Check if documents exist
    if (!productsOfTheDay.documents || productsOfTheDay.documents.length === 0) {
      console.log("No products found in the 'Product of the Day' collection, fetching featured products as fallback");
      
      // Fallback: Fetch featured products instead
      const featuredProducts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.productscollectionId,
        [
          Query.equal('isFeatured', true),
          Query.limit(5),
          Query.orderDesc('$createdAt')
        ]
      );

      if (featuredProducts.documents.length > 0) {
        console.log("Using featured products as fallback:", featuredProducts.documents.length);
        return featuredProducts.documents.map((productData) => {
          const priceInRupees = productData.price / 100;
          return {
            $id: productData.$id,
            productId: productData.productId,
            name: productData.name,
            description: productData.description,
            price: priceInRupees,
            formattedPrice: new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(priceInRupees),
            mrp: productData.mrp ? productData.mrp / 100 : null,
            formattedMrp: productData.mrp ? new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(productData.mrp / 100) : null,
            discount: productData.discount,
            imageUrl: productData.imageUrl,
            stock: productData.stock,
            unit: productData.unit,
            isFeatured: productData.isFeatured,
            categoryId: productData.categoryId,
            createdAt: productData.createdAt,
            updatedAt: productData.updatedAt,
          };
        });
      }
      
      return []; // Return empty array if no featured products either
    }

    // Step 2: Extract productId from each document (try both field names for compatibility)
    const productIds = productsOfTheDay.documents.map((doc) => {
      // Handle both 'ProductId' (capital P) and 'productId' (lowercase p) for compatibility
      return doc.ProductId || doc.productId;
    }).filter(id => id); // Filter out undefined values

    console.log("Extracted Product IDs:", productIds);

    if (productIds.length === 0) {
      console.log("No valid product IDs found");
      return [];
    }

    // Step 3: Fetch details for each product using document ID
    const products = await Promise.all(
      productIds.map(async (productId: string) => {
        try {
          // Use getDocument instead of listDocuments for better performance when fetching by ID
          const productData = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.productscollectionId,
            productId
          );

          // Convert price from cents to rupees and format
          const priceInRupees = productData.price / 100;
          const formattedPrice = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(priceInRupees);

          return {
            $id: productData.$id,
            productId: productData.productId, // Product code
            name: productData.name,
            description: productData.description,
            price: priceInRupees, // Store as number for calculations
            formattedPrice: formattedPrice, // Store formatted string for display
            mrp: productData.mrp ? productData.mrp / 100 : null, // Convert MRP too
            formattedMrp: productData.mrp ? new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(productData.mrp / 100) : null,
            discount: productData.discount, // Discount is already a percentage
            imageUrl: productData.imageUrl,
            stock: productData.stock,
            unit: productData.unit,
            isFeatured: productData.isFeatured,
            categoryId: productData.categoryId,
            createdAt: productData.createdAt,
            updatedAt: productData.updatedAt,
          };
        } catch (error) {
          console.warn(`Product with ID ${productId} not found:`, error);
          return null;
        }
      })
    );

    // Filter out null values and log the fetched products
    const validProducts = products.filter(product => product !== null);
    console.log("Fetched Products:", validProducts);

    // Step 4: Return the fetched products
    return validProducts;
  } catch (error) {
    console.error("Error in fetchProductOfTheDay:", error);
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};