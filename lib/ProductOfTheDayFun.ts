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
      throw new Error("No products found in the 'Product of the Day' collection");
    }

    // Step 2: Extract ProductId from each document
    const productIds = productsOfTheDay.documents.map((doc) => doc.ProductId);
    console.log("Extracted Product IDs:", productIds);

    // Step 3: Fetch details for each product
    const products = await Promise.all(
      productIds.map(async (productId: string) => {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.productscollectionId,
          [Query.equal("$id", productId.toString())] // Changed back to $id
        );

        // Check if product details exist
        if (!response.documents || response.documents.length === 0) {
          console.warn(`Product with ID ${productId} not found`);
          return null;
        }

        // Extract product details
        const productData = response.documents[0];
        return {
          productId: productData.$id,
          name: productData.name,
          price: `₹${productData.price}`,
          imageUrl: productData.imageUrl,
        };
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