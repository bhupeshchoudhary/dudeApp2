import React, { useState } from 'react';
import { Modal, View, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

interface QuantityModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  maxQuantity?: number;
}

const QuantityModal: React.FC<QuantityModalProps> = ({
  visible,
  onClose,
  onConfirm,
  maxQuantity = 99
}) => {
  const [quantity, setQuantity] = useState('1');

  const handleQuantityChange = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');
    if (numValue === '' || (parseInt(numValue) >= 1 && parseInt(numValue) <= maxQuantity)) {
      setQuantity(numValue);
    }
  };

  const handleConfirm = () => {
    const numQuantity = parseInt(quantity) || 1;
    onConfirm(numQuantity);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="bg-white max-w-sm w-11/12 rounded-2xl p-6 shadow-lg">
            <Text className="text-xl font-semibold text-center mb-5" children="Select Quantity" />
            
            <TextInput
              value={quantity}
              onChangeText={handleQuantityChange}
              keyboardType="number-pad"
              className="border border-gray-300 rounded-lg p-4 text-center text-lg focus:border-blue-500 outline-none"
              maxLength={2}
            />

            <View className="flex-row justify-between mt-6 space-x-4">
              <Button
                onPress={onClose}
                className="bg-gray-100 flex-1 py-3 rounded-lg mr-2"
                children={<Text className="text-gray-900 text-base font-medium" children="Cancel" />}
              />
              <Button
                onPress={handleConfirm}
                className="bg-blue-600 flex-1 py-3 rounded-lg ml-2"
                children={<Text className="text-white text-base font-medium" children="Add to Cart" />}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default QuantityModal;
