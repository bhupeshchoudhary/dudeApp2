// Test script for related products functionality
const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('6780e3ff00052183da93');

const databases = new Databases(client);

const appwriteConfig = {
  databaseId: '67811767003984166d8d',
  productscollectionId: '67841fbe001f1492ed9b',
  categoriesCollectionId: '6784211500075796cdb3',
};

async function testRelatedProducts() {
  try {
    console.log('=== Testing Related Products Database Queries ===');
    
    // Test 1: Get all products
    console.log('\n1. Testing: Get all products');
    const allProducts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productscollectionId,
      [Query.limit(5)]
    );

    console.log(`Found ${allProducts.documents.length} products`);
    allProducts.documents.forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        id: product.$id,
        name: product.name,
        categoryId: product.categoryId,
        isFeatured: product.isFeatured
      });
    });
    
    if (allProducts.documents.length === 0) {
      console.log('No products found. Cannot test related products.');
      return;
    }
    
    // Test 2: Get products by category
    const testProduct = allProducts.documents[0];
    console.log('\n2. Testing: Get products by category');
    console.log('Using product:', {
      id: testProduct.$id,
      name: testProduct.name,
      categoryId: testProduct.categoryId
    });
    
    const relatedProducts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productscollectionId,
      [
        Query.equal('categoryId', testProduct.categoryId),
        Query.notEqual('$id', testProduct.$id),
        Query.limit(6)
      ]
    );

    console.log(`Found ${relatedProducts.documents.length} related products`);
    relatedProducts.documents.forEach((product, index) => {
      console.log(`Related Product ${index + 1}:`, {
        id: product.$id,
        name: product.name,
        categoryId: product.categoryId
      });
    });
    
    // Test 3: Get featured products as fallback
    console.log('\n3. Testing: Get featured products');
    const featuredProducts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productscollectionId,
      [
        Query.equal('isFeatured', true),
        Query.notEqual('$id', testProduct.$id),
        Query.limit(6)
      ]
    );

    console.log(`Found ${featuredProducts.documents.length} featured products`);
    featuredProducts.documents.forEach((product, index) => {
      console.log(`Featured Product ${index + 1}:`, {
        id: product.$id,
        name: product.name,
        categoryId: product.categoryId,
        isFeatured: product.isFeatured
      });
    });
    
    // Test 4: Check categories
    console.log('\n4. Testing: Get categories');
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      [Query.limit(5)]
    );
    
    console.log(`Found ${categories.documents.length} categories`);
    categories.documents.forEach((category, index) => {
      console.log(`Category ${index + 1}:`, {
        id: category.$id,
        name: category.name,
        categoryId: category.categoryId
      });
    });
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
  }
}

// Run the test
testRelatedProducts(); 