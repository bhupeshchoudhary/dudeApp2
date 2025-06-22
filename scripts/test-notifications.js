#!/usr/bin/env node

/**
 * Test script for notification system
 * Run with: node scripts/test-notifications.js
 */

const { sendOrderNotification, sendPromotionalNotification, sendProductNotification, sendGeneralNotification } = require('../lib/sendNotification');

async function testNotifications() {
  console.log('🧪 Testing Notification System...\n');

  try {
    // Test 1: Order Notification
    console.log('📦 Testing Order Notification...');
    await sendOrderNotification(
      'test-user-id',
      'test-order-123',
      'confirmed',
      'ORD123'
    );
    console.log('✅ Order notification test completed\n');

    // Test 2: Promotional Notification
    console.log('🏷️ Testing Promotional Notification...');
    await sendPromotionalNotification(
      'Special Test Offer!',
      'This is a test promotional notification. Get 20% off!',
      'test-promo-123'
    );
    console.log('✅ Promotional notification test completed\n');

    // Test 3: Product Notification
    console.log('📱 Testing Product Notification...');
    await sendProductNotification(
      'New Test Product!',
      'Check out our latest test product with amazing features!',
      'test-product-123'
    );
    console.log('✅ Product notification test completed\n');

    // Test 4: General Notification
    console.log('📢 Testing General Notification...');
    await sendGeneralNotification(
      'Test App Update',
      'This is a test general notification for app updates!',
      'test-update'
    );
    console.log('✅ General notification test completed\n');

    console.log('🎉 All notification tests completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check your Appwrite console for notification records');
    console.log('2. Verify FCM tokens are being saved');
    console.log('3. Test on a physical device with the app installed');
    console.log('4. Check notification permissions in device settings');

  } catch (error) {
    console.error('❌ Notification test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check Appwrite connection');
    console.log('2. Verify collection permissions');
    console.log('3. Check console for detailed error messages');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testNotifications();
}

module.exports = { testNotifications }; 