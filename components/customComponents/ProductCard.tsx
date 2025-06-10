import React, { useEffect, useState } from 'react';
import {Text, View, Image, TouchableOpacity} from "react-native";
import { Product } from "@/types/productTypes";
import { useGlobalContext } from '@/context/GlobalProvider';
import { fetchPriceMultiplierByPincode, calculateAdjustedPrice } from '@/lib/handleLocation';
import { User } from '@/types/userTypes';

interface ProductCardProps {
  product?: Product;
  image?: { uri: string };
  name?: string;
  price?: string;
  mrp?: string;
  discount?: string;
  weight?: string;
  large?: boolean;
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product,
  image, 
  name, 
  price, 
  mrp, 
  discount, 
  weight, 
  large,
  onPress 
}) => {
  const { user } = useGlobalContext() as { user: User | null };
  const [adjustedPrice, setAdjustedPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLocationPrice = async () => {
      setIsLoading(true);
      try {
        if (product && user?.deliveryAddress?.pincode) {
          const priceMultiplier = await fetchPriceMultiplierByPincode(user.deliveryAddress.pincode);
          console.log('Price Multiplier:', priceMultiplier); // Debug log
          const adjusted = calculateAdjustedPrice(product.price, priceMultiplier);
          console.log('Original Price:', product.price, 'Adjusted Price:', adjusted); // Debug log
          setAdjustedPrice(adjusted);
        } else {
          setAdjustedPrice(product?.price || null);
        }
      } catch (error) {
        console.error('Error loading location price:', error);
        setAdjustedPrice(product?.price || null);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocationPrice();
  }, [product, user?.deliveryAddress?.pincode]);

  // Use product data if provided, otherwise use individual props
  const displayName = product?.name || name || '';
  const displayPrice = isLoading 
    ? 'Loading...' 
    : product 
      ? `₹${adjustedPrice !== null ? adjustedPrice : product.price}` 
      : price || '';
  const displayMrp = product?.mrp ? `₹${product.mrp}` : mrp;
  const displayDiscount = product?.discount ? `${product.discount}% OFF` : discount;
  const displayWeight = product?.unit || weight;
  const displayImage = product ? { uri: product.imageUrl } : image || { uri: '' };

  return (
    <TouchableOpacity 
      className={`${large ? 'w-64' : 'w-32'} mr-4 bg-white rounded-lg p-2`}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Image 
        source={displayImage} 
        className="w-full h-32 rounded-lg"
        resizeMode="cover"
      />
      <View className="p-2">
        <Text className="font-bold mt-2" numberOfLines={2} children={displayName} />
        {displayWeight && <Text className="text-gray-500 text-sm" children={displayWeight} />}
        <View className="flex-row items-center mt-1">
          <Text className="font-bold text-lg" children={displayPrice} />
          {displayMrp && (
            <Text className="text-gray-500 line-through ml-2 text-sm" children={displayMrp} />
          )}
        </View>
      </View>
      {displayDiscount && (
        <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded">
          <Text className="text-white text-xs" children={displayDiscount} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ProductCard;