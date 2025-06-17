// import React, { useState } from 'react';
// import { Modal, View, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
// import { Text } from '@/components/ui/Text';
// import { Button } from '@/components/ui/Button';

// interface QuantityModalProps {
//   visible: boolean;
//   onClose: () => void;
//   onConfirm: (quantity: number) => void;
//   maxQuantity?: number;
// }

// const QuantityModal: React.FC<QuantityModalProps> = ({
//   visible,
//   onClose,
//   onConfirm,
//   maxQuantity = 99
// }) => {
//   const [quantity, setQuantity] = useState('1');

//   const handleQuantityChange = (value: string) => {
//     const numValue = value.replace(/[^0-9]/g, '');
//     if (numValue === '' || (parseInt(numValue) >= 1 && parseInt(numValue) <= maxQuantity)) {
//       setQuantity(numValue);
//     }
//   };

//   const handleConfirm = () => {
//     const numQuantity = parseInt(quantity) || 1;
//     onConfirm(numQuantity);
//     onClose();
//   };

//   return (
//     <Modal
//       transparent
//       visible={visible}
//       animationType="slide"
//       onRequestClose={onClose}
//     >
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <View className="flex-1 justify-center items-center bg-black/60 px-4">
//           <View className="bg-white max-w-sm w-11/12 rounded-2xl p-6 shadow-lg">
//             <Text className="text-xl font-semibold text-center mb-5" children="Select Quantity" />
            
//             <TextInput
//               value={quantity}
//               onChangeText={handleQuantityChange}
//               keyboardType="number-pad"
//               className="border border-gray-300 rounded-lg p-4 text-center text-lg focus:border-blue-500 outline-none"
//               maxLength={2}
//             />

//             <View className="flex-row justify-between mt-6 space-x-4">
//               <Button
//                 onPress={onClose}
//                 className="bg-gray-100 flex-1 py-3 rounded-lg mr-2"
//                 children={<Text className="text-gray-900 text-base font-medium" children="Cancel" />}
//               />
//               <Button
//                 onPress={handleConfirm}
//                 className="bg-blue-600 flex-1 py-3 rounded-lg ml-2"
//                 children={<Text className="text-white text-base font-medium" children="Add to Cart" />}
//               />
//             </View>
//           </View>
//         </View>
//       </TouchableWithoutFeedback>
//     </Modal>
//   );
// };

// export default QuantityModal;








// File: @/components/customComponents/cart/CartDialogBox.tsx

import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Text } from '../../ui/Text';

interface QuantityModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  maxQuantity: number;
  currentCartQuantity?: number; // Add this prop
}

const QuantityModal: React.FC<QuantityModalProps> = ({ 
  visible, 
  onClose, 
  onConfirm, 
  maxQuantity,
  currentCartQuantity = 0 // Default to 0 if not provided
}) => {
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    if (visible) {
      setQuantity('1'); // Reset to 1 when modal opens
    }
  }, [visible]);

  const handleConfirm = () => {
    const newQuantity = parseInt(quantity) || 1;
    
    if (newQuantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity greater than 0');
      return;
    }
    
    if (currentCartQuantity + newQuantity > maxQuantity) {
      Alert.alert(
        'Insufficient Stock', 
        `You can only add ${maxQuantity - currentCartQuantity} more items. Currently ${currentCartQuantity} in cart.`
      );
      return;
    }
    
    onConfirm(newQuantity);
    onClose();
  };

  const availableToAdd = maxQuantity - currentCartQuantity;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-6 rounded-lg mx-4 w-80">
          <Text className="text-lg font-bold mb-2">Add to Cart</Text>
          
          {currentCartQuantity > 0 && (
            <View className="bg-blue-50 p-3 rounded-lg mb-4">
              <Text className="text-blue-700 text-sm">
                Currently in cart: {currentCartQuantity}
              </Text>
              <Text className="text-blue-600 text-sm">
                Available to add: {availableToAdd}
              </Text>
            </View>
          )}
          
          <Text className="text-gray-600 mb-2">Enter quantity to add:</Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg p-3 mb-4 text-center text-lg"
            placeholder="Enter quantity"
            selectTextOnFocus
            maxLength={3}
          />
          
          <Text className="text-gray-500 text-sm mb-4 text-center">
            Max available: {availableToAdd}
          </Text>
          
          <View className="flex-row justify-end gap-3">
            <TouchableOpacity onPress={onClose} className="px-4 py-2">
              <Text className="text-gray-600">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleConfirm} 
              className="bg-orange-500 px-6 py-2 rounded-lg"
              disabled={availableToAdd <= 0}
            >
              <Text className="text-white font-medium">
                {availableToAdd <= 0 ? 'No Stock' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default QuantityModal;