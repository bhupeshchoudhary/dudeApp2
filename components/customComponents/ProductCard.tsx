import React, { useEffect, useState } from 'react';
import {Text, View, Image, TouchableOpacity, Dimensions} from "react-native";
import { Product } from "@/types/productTypes";
import { useGlobalContext } from '@/context/GlobalProvider';
import { fetchPriceMultiplierByPincode, calculateAdjustedPrice } from '@/lib/handleLocation';
import { User } from '@/types/userTypes';
import { addToCart } from '@/lib/handleCart';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

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
  showAddToCart?: boolean;
  isRelatedProduct?: boolean; // New prop for related products
  cardWidth?: number;
  cardHeight?: number;
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
  onPress,
  showAddToCart = false,
  isRelatedProduct = false,
  cardWidth,
  cardHeight
}) => {
  const { user } = useGlobalContext() as { user: User | null };
  const [adjustedPrice, setAdjustedPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get screen width for responsive design
  const screenWidth = Dimensions.get('window').width;
  
  // Calculate card dimensions based on props
  const getCardDimensions = () => {
    if (cardWidth && cardHeight) {
      return {
        width: cardWidth,
        height: cardHeight,
        imageHeight: cardHeight - 100,
        fontSize: 'text-xs',
      };
    }
    
    if (isRelatedProduct) {
      // Fixed dimensions for related products to ensure consistency
      return {
        width: 160,
        height: 220,
        imageHeight: 120,
        fontSize: 'text-xs'
      };
    }
    
    if (large) {
      return {
        width: screenWidth * 0.4,
        height: 250,
        imageHeight: 120,
        fontSize: 'text-sm'
      };
    }
    
    return {
      width: screenWidth * 0.45,
      height: 240,
      imageHeight: 140,
      fontSize: 'text-xs'
    };
  };

  const dimensions = getCardDimensions();

  // Debug logging for product data
  useEffect(() => {
    if (product) {
      console.log('ProductCard rendering product:', {
        id: product.$id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        isRelatedProduct,
        dimensions: dimensions
      });
    }
  }, [product, isRelatedProduct, dimensions]);

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

  const handleAddToCart = async () => {
    if (!product || addingToCart || !user?.$id) return;
    
    setAddingToCart(true);
    try {
      await addToCart(
        user.$id,
        product.$id,
        1,
        product.price,
        product.imageUrl,
        product.name,
        user.deliveryAddress?.pincode
      );
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add item to cart',
      });
    } finally {
      setAddingToCart(false);
    }
  };

  // Use product data if provided, otherwise use individual props
  const displayName = product?.name || name || 'No Name';
  const displayPrice = isLoading 
    ? 'Loading...' 
    : product 
      ? `₹${adjustedPrice !== null ? adjustedPrice : product.price}` 
      : price || 'N/A';
  const displayMrp = product?.mrp ? `₹${product.mrp}` : mrp || '';
  const displayDiscount = (product?.discount && product.discount > 0) ? `${product.discount}% OFF` : (discount && discount !== '0' ? discount : '');
  const displayWeight = product?.unit || weight || '';
  const displayImage = product ? { uri: product.imageUrl } : image || { uri: '' };

  const handleImageError = () => {
    console.warn('Image failed to load for product:', product?.name);
    setImageError(true);
  };

  useEffect(() => {
    if (!product) {
      console.warn('ProductCard: No product data provided!');
    } else {
      if (!product.name) console.warn('ProductCard: Product missing name:', product);
      if (!product.price) console.warn('ProductCard: Product missing price:', product);
      if (!product.imageUrl) console.warn('ProductCard: Product missing imageUrl:', product);
    }
  }, [product]);

  return (
    <View
      style={{
        width: dimensions.width,
        height: dimensions.height,
        marginRight: isRelatedProduct ? 12 : 8,
      }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
    >
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <View className="relative">
          <Image
            source={imageError ? require('../../assets/images/ratana.png') : displayImage}
            style={{
              width: '100%',
              height: dimensions.imageHeight,
            }}
            className="rounded-t-xl"
            resizeMode="cover"
            onError={handleImageError}
            defaultSource={require('../../assets/images/ratana.png')}
          />
          {displayDiscount && (
            <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-full">
              <Text
                className="text-white text-xs font-medium"
                children={displayDiscount}
              />
            </View>
          )}
          {showAddToCart && product && (
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: -12, alignItems: 'center', zIndex: 2 }}>
              <TouchableOpacity
                onPress={handleAddToCart}
                disabled={addingToCart}
                className="bg-orange-500 rounded-lg py-1.5 px-4 flex-row items-center justify-center shadow-lg"
                activeOpacity={0.8}
              >
                {addingToCart ? (
                  <Text className="text-white text-xs font-medium">Adding...</Text>
                ) : (
                  <>
                    <Ionicons name="add" size={14} color="white" />
                    <Text className="text-white text-xs font-medium ml-1">
                      Add to Cart
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View className="p-2 flex-1 flex flex-col justify-between mt-2">
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
          <Text
            className={`font-semibold text-gray-900 ${dimensions.fontSize}`}
            numberOfLines={2}
            children={displayName}
          />
          {displayWeight && (
            <Text
              className="text-gray-600 text-xs mt-1"
              children={displayWeight}
            />
          )}
          <View className="flex-row items-center mt-1">
            <Text
              className="font-bold text-base text-orange-700"
              children={displayPrice}
            />
            {displayMrp && (
              <Text
                className="text-gray-400 line-through ml-2  text-xs"
                children={displayMrp}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductCard;