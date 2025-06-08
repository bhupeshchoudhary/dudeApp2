import { Models } from 'react-native-appwrite';

export interface DeliveryAddress {
  name: string;
  address: string;
  pincode: string;
  phone: string;
}

export interface User extends Models.Document {
  email: string;
  name: string;
  deliveryAddress?: DeliveryAddress;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
  };
}
