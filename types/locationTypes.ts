export interface Location {
  $id: string;
  name: string;
  pincode: string;
  priceMultiplier: number;
  isServiceable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationWithPrice extends Location {
  originalPrice: number;
  adjustedPrice: number;
} 