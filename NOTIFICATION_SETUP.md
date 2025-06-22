# Notification System Setup Guide (Android Only)

## Overview
This guide will help you set up a complete notification system for your React Native/Expo app using Firebase Cloud Messaging (FCM) and Appwrite backend. **This setup is for Android only.**

## Features Implemented

### ✅ What's Already Done
1. **Notification Service** - Complete notification management system
2. **Notification Context** - React context for state management
3. **Notification Bell Component** - UI component with badge count
4. **Notifications Screen** - Full notification history and management
5. **Notification Settings Screen** - User preferences management
6. **Server-side Notification Sender** - Functions to send notifications
7. **Integration with Home Screen** - Notification bell in header
8. **Profile Integration** - Settings link in profile menu

### 🔧 What You Need to Configure

## Step 1: Firebase Configuration (Android Only)

### 1.1 Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Add your Android app:
   - **Android Package Name**: `com.sumit9897.dude`
   - **App nickname**: Ratana App (optional)
   - **Debug signing certificate SHA-1**: (optional for now)

### 1.2 Download Configuration File
- **Android**: Download `google-services.json` (already in root directory)
- Verify the file contains your project configuration

### 1.3 Enable Cloud Messaging
1. In Firebase Console, go to **Project Settings** > **Cloud Messaging**
2. Enable Cloud Messaging API
3. Note down your **Server Key** (you'll need this for server-side notifications)

## Step 2: Appwrite Collections Setup

### 2.1 Create FCM Tokens Collection
Create a collection named `fcm_tokens` with the following structure:

```json
{
  "userId": "string",
  "token": "string", 
  "deviceId": "string",
  "platform": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**Permissions**: Read/Write for authenticated users

### 2.2 Create Notifications Collection
Create a collection named `notifications` with the following structure:

```json
{
  "userId": "string",
  "title": "string",
  "body": "string", 
  "data": "object",
  "type": "string",
  "read": "boolean",
  "date": "datetime",
  "createdAt": "datetime"
}
```

**Permissions**: Read/Write for authenticated users

## Step 3: EAS Build Configuration

### 3.1 Update eas.json (if needed)
Make sure your `eas.json` includes the notification configuration:

```json
{
  "build": {
    "development": {
      "android": {
        "googleServicesFile": "./google-services.json"
      }
    },
    "production": {
      "android": {
        "googleServicesFile": "./google-services.json"
      }
    }
  }
}
```

### 3.2 Build the App
```bash
# For development
eas build --platform android --profile development

# For production
eas build --platform android --profile production
```

## Step 4: Server-Side Notification Setup

### 4.1 Appwrite Cloud Function (Optional)
Create an Appwrite Cloud Function to send notifications:

```javascript
// Example Cloud Function
const { databases } = require('node-appwrite');

module.exports = async (req, res) => {
  const { title, body, userIds, type, data } = req.payload;
  
  // Get FCM tokens
  const tokens = await databases.listDocuments(
    'your-database-id',
    'fcm_tokens',
    [
      Query.equal('userId', userIds)
    ]
  );
  
  // Send notifications via Firebase Admin SDK
  // Implementation depends on your server setup
  
  return res.json({ success: true });
};
```

### 4.2 Firebase Admin SDK Setup
For server-side notifications, you'll need Firebase Admin SDK:

```bash
npm install firebase-admin
```

## Step 5: Testing the Notification System

### 5.1 Test Local Notifications
1. Open the app on Android device
2. Go to Profile > Notification Settings
3. Tap "Send Test Notification"
4. You should receive a local notification

### 5.2 Test Push Notifications
1. Build and install the app on a physical Android device
2. Grant notification permissions when prompted
3. Use the notification sender functions to send test notifications

## Step 6: Usage Examples

### 6.1 Send Order Notification
```javascript
import { sendOrderNotification } from '../lib/sendNotification';

// When order status changes
await sendOrderNotification(userId, orderId, 'confirmed', 'ORD123');
```

### 6.2 Send Promotional Notification
```javascript
import { sendPromotionalNotification } from '../lib/sendNotification';

// Send promotional notification to all users
await sendPromotionalNotification(
  'Special Offer!',
  'Get 20% off on all electronics. Limited time only!',
  'promo123'
);
```

### 6.3 Send Product Notification
```javascript
import { sendProductNotification } from '../lib/sendNotification';

// Notify about new product
await sendProductNotification(
  'New Product Available!',
  'Check out our latest smartphone with amazing features!',
  'product123'
);
```

## Step 7: Customization

### 7.1 Notification Icons
Update notification icons in `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/ratana.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

### 7.2 Notification Styling
Customize notification appearance in `components/NotificationBell.tsx` and `app/notifications.tsx`.

## Troubleshooting

### Common Issues

1. **Notifications not showing on Android**
   - Check if `google-services.json` is properly configured
   - Ensure notification permissions are granted
   - Verify FCM token is being generated
   - Check that the app is built with the correct configuration

2. **FCM Token not saving**
   - Check Appwrite collection permissions
   - Verify database connection
   - Check console for error messages

3. **Notification navigation not working**
   - Ensure notification data contains correct IDs
   - Check if target screens exist
   - Verify navigation logic in `notificationService.ts`

4. **Build errors**
   - Ensure `google-services.json` is in the root directory
   - Check that all dependencies are installed
   - Verify EAS project ID is correct

### Debug Commands
```bash
# Check notification permissions
expo notifications:permissions

# Test push notification
expo notifications:send --title "Test" --body "Test message"

# View notification logs
expo logs

# Check if google-services.json is valid
cat google-services.json
```

## Security Considerations

1. **FCM Token Security**
   - Store tokens securely in Appwrite
   - Implement token refresh logic
   - Clean up invalid tokens

2. **Notification Content**
   - Validate notification content before sending
   - Implement rate limiting
   - Sanitize user input

3. **User Privacy**
   - Respect user notification preferences
   - Provide easy opt-out options
   - Follow GDPR guidelines

## Performance Optimization

1. **Batch Notifications**
   - Send notifications in batches
   - Implement notification queuing
   - Use background processing

2. **Token Management**
   - Regularly clean up invalid tokens
   - Implement token refresh
   - Monitor token usage

3. **Database Optimization**
   - Index frequently queried fields
   - Implement pagination for notification history
   - Archive old notifications

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase and Expo documentation
3. Check Appwrite documentation for backend issues
4. Test with different Android devices and versions

## Next Steps

1. **Analytics Integration**
   - Track notification open rates
   - Monitor user engagement
   - A/B test notification content

2. **Advanced Features**
   - Rich notifications with images
   - Action buttons in notifications
   - Scheduled notifications
   - Location-based notifications

3. **User Experience**
   - Notification preferences sync
   - Smart notification timing
   - Personalized notification content 