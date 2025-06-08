import React, { useEffect, useState } from 'react';
import {Text, View, Image, TouchableOpacity} from "react-native";
import { Product } from "@/types/productTypes";
import { useGlobalContext } from '@/context/GlobalProvider';
import { fetchLocationByPincode, calculateAdjustedPrice } from '@/lib/handleLocation';

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
  const { user } = useGlobalContext();
  const [adjustedPrice, setAdjustedPrice] = useState<number | null>(null);

  useEffect(() => {
    const loadLocationPrice = async () => {
      if (product && user?.deliveryAddress?.pincode) {
        try {
          const location = await fetchLocationByPincode(user.deliveryAddress.pincode);
          if (location) {
            const adjusted = calculateAdjustedPrice(product.price, location.priceMultiplier);
            setAdjustedPrice(adjusted);
          }
        } catch (error) {
          console.error('Error loading location price:', error);
        }
      }
    };

    loadLocationPrice();
  }, [product, user?.deliveryAddress?.pincode]);

  // Use product data if provided, otherwise use individual props
  const displayName = product?.name || name || '';
  const displayPrice = product ? `₹${adjustedPrice || product.price}` : price || '';
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