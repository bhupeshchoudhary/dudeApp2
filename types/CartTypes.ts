export interface CartItem {
  $id?: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  pincodeId?: string;
  createdAt?: string;
  updatedAt?: string;
} 