export interface Location {
  $id: string;
  name: string;
  pincode: string;
  priceMultiplier: number;
  isServiceable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pincode {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  pincode: string;
  area: string;
  city: string;
  state: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceMultiplier {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  pincodeId: string;
  multiplierValue: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationWithPrice extends Location {
  originalPrice: number;
  adjustedPrice: number;
} 