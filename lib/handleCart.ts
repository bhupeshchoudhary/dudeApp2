import { appwriteConfig } from "./appwrite";
import { ID, Query, AppwriteException } from "react-native-appwrite";
import { databases } from "./appwrite";

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  imageUrl: string;
  name: string;
}

// Helper function to validate cart item
const validateCartItem = (item: CartItem): void => {
  if (!item.productId || typeof item.productId !== 'string') {
    throw new Error('Invalid product ID');
  }
  if (!item.name || typeof item.name !== 'string') {
    throw new Error('Invalid product name');
  }
  if (typeof item.quantity !== 'number' || item.quantity <= 0) {
    throw new Error('Invalid quantity');
  }
  if (typeof item.price !== 'number' || item.price < 0) {
    throw new Error('Invalid price');
  }
  if (!item.imageUrl || typeof item.imageUrl !== 'string') {
    throw new Error('Invalid image URL');
  }
};

// Helper function to parse cart items
const parseCartItems = (items: string[]): CartItem[] => {
  return items
    .map((item: string) => {
      try {
        const parsedItem = JSON.parse(item);
        validateCartItem(parsedItem);
        return parsedItem;
      } catch (e) {
        console.error('Error parsing cart item:', e);
        return null;
      }
    })
    .filter((item): item is CartItem => item !== null);
};

export const addToCart = async (
  userId: string, 
  productId: string, 
  quantity: number, 
  price: number,
  imageUrl: string,
  name: string
) => {
  try {
    if (!userId) throw new Error('User ID is required');

    // Validate input
    const newItem: CartItem = { productId, quantity, price, imageUrl, name };
    validateCartItem(newItem);

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.cartsCollectionId,
      [Query.equal('userId', userId)]
    );

    const newItemString = JSON.stringify(newItem);

    if (response.documents.length > 0) {
      const cart = response.documents[0];
      let items = cart.items || [];

      if (items.length >= 100) {
        throw new Error('Cart is full. Please remove some items before adding more.');
      }

      const existingItemIndex = items.findIndex((item: string) => {
        try {
          const parsedItem: CartItem = JSON.parse(item);
          return parsedItem.productId === productId;
        } catch (e) {
          console.error('Error parsing cart item:', e);
          return false;
        }
      });

      if (existingItemIndex !== -1) {
        const existingItem: CartItem = JSON.parse(items[existingItemIndex]);
        existingItem.quantity += quantity;
        items[existingItemIndex] = JSON.stringify(existingItem);
      } else {
        items.push(newItemString);
      }

      return await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.cartsCollectionId,
        cart.$id,
        { 
          items, 
          updatedAt: new Date().toISOString() 
        }
      );
    } else {
      return await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.cartsCollectionId,
        ID.unique(),
        {
          userId,
          items: [newItemString],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    if (error instanceof AppwriteException) {
      throw new Error('Failed to update cart. Please try again later.');
    }
    throw error;
  }
};

export const fetchCart = async (userId: string) => {
  try {
    if (!userId) throw new Error('User ID is required');

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.cartsCollectionId,
      [Query.equal('userId', userId)]
    );

    if (response.documents.length > 0) {
      const cart = response.documents[0];
      const items = parseCartItems(cart.items || []);
      return { items, updatedAt: cart.updatedAt };
    }
    return { items: [], updatedAt: null };
  } catch (error) {
    console.error('Error fetching cart:', error);
    if (error instanceof AppwriteException) {
      throw new Error('Failed to fetch cart. Please try again later.');
    }
    throw error;
  }
};

export const updateCart = async (
  userId: string, 
  items: CartItem[]
) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!Array.isArray(items)) throw new Error('Invalid items array');

    // Validate all items
    items.forEach(validateCartItem);

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.cartsCollectionId,
      [Query.equal('userId', userId)]
    );

    const serializedItems = items.map(item => JSON.stringify(item));

    if (response.documents.length > 0) {
      const cartId = response.documents[0].$id;
      return await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.cartsCollectionId,
        cartId,
        { 
          items: serializedItems, 
          updatedAt: new Date().toISOString() 
        }
      );
    } else {
      return await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.cartsCollectionId,
        ID.unique(),
        {
          userId,
          items: serializedItems,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    if (error instanceof AppwriteException) {
      throw new Error('Failed to update cart. Please try again later.');
    }
    throw error;
  }
};

export const removeFromCart = async (userId: string, productId: string) => {
  try {
    if (!userId || !productId) throw new Error('User ID and Product ID are required');

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.cartsCollectionId,
      [Query.equal('userId', userId)]
    );

    if (response.documents.length > 0) {
      const cart = response.documents[0];
      const items = parseCartItems(cart.items || []);
      
      const updatedItems = items
        .filter(item => item.productId !== productId)
        .map(item => JSON.stringify(item));

      return await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.cartsCollectionId,
        cart.$id,
        { 
          items: updatedItems, 
          updatedAt: new Date().toISOString() 
        }
      );
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    if (error instanceof AppwriteException) {
      throw new Error('Failed to remove item from cart. Please try again later.');
    }
    throw error;
  }
};

export const clearCart = async (userId: string) => {
  try {
    if (!userId) throw new Error('User ID is required');

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.cartsCollectionId,
      [Query.equal('userId', userId)]
    );

    if (response.documents.length > 0) {
      const cartId = response.documents[0].$id;
      return await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.cartsCollectionId,
        cartId,
        { 
          items: [], 
          updatedAt: new Date().toISOString() 
        }
      );
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    if (error instanceof AppwriteException) {
      throw new Error('Failed to clear cart. Please try again later.');
    }
    throw error;
  }
};