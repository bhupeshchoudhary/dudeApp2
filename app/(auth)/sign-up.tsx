import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, Redirect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useGlobalContext } from '../../context/GlobalProvider';
import { createUser } from '../../lib/handleAuth';

const SignUp = () => {
  const { setUser, setIsLogged, isLogged } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    shopName: '',
    pincode: '',
    retailCode: '',
  });

  // Redirect if already logged in
  if (isLogged) {
    return <Redirect href="/home" />;
  }

  const validateForm = () => {
    // Name validation
    if (!formData.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your full name',
      });
      return false;
    }

    // Phone validation
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid 10-digit phone number',
      });
      return false;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid email address',
      });
      return false;
    }

    // Password validation (minimum 6 characters)
    if (formData.password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Password must be at least 6 characters long',
      });
      return false;
    }

    // Address validation
    if (!formData.address.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your address',
      });
      return false;
    }

    // Shop name validation
    if (!formData.shopName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your shop name',
      });
      return false;
    }

    // Pincode validation
    if (!/^[0-9]{6}$/.test(formData.pincode)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid 6-digit pincode',
      });
      return false;
    }

    // Terms acceptance validation
    if (!acceptTerms) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please accept the terms and conditions',
      });
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await createUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        shopName: formData.shopName,
        pincode: formData.pincode,
        retailCode: formData.retailCode,
      });
      
      setUser(result);
      setIsLogged(true);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Account created successfully',
      });
      
      router.replace('/home');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Signup failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    keyboardType: 'default' | 'email-address' | 'numeric' | 'phone-pad' = 'default',
    secureTextEntry = false,
    maxLength?: number
  ) => (
    <View className="mb-4">
      <Text className="text-sm font-medium mb-1 text-gray-600">{label}</Text>
      <View className="relative">
        <TextInput
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          autoCapitalize="none"
          placeholderTextColor="#9CA3AF"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            className="absolute right-3 top-3"
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={['#f0f9ff', '#ffffff']}
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerClassName="flex-grow"
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 py-8">
              {/* Header */}
              <View className="items-center mb-8">
                <Image
                  source={require('../../assets/images/ratana.jpg')}
                  className="w-20 h-20 rounded-full mb-4"
                />
                <Text className="text-3xl font-bold text-gray-800 mb-2">
                  Create Account
                </Text>
                <Text className="text-gray-600 text-center">
                  Join us to start your retail journey
                </Text>
              </View>

              {/* Form */}
              {renderInput(
                'Full Name',
                formData.name,
                (text) => setFormData({ ...formData, name: text }),
                'Enter your full name'
              )}

              {renderInput(
                'Phone Number',
                formData.phone,
                (text) => setFormData({ ...formData, phone: text }),
                'Enter your phone number',
                'phone-pad',
                false,
                10
              )}

              {renderInput(
                'Email Address',
                formData.email,
                (text) => setFormData({ ...formData, email: text }),
                'Enter your email',
                'email-address'
              )}

              {renderInput(
                'Password',
                formData.password,
                (text) => setFormData({ ...formData, password: text }),
                'Create a password (min. 6 characters)',
                'default',
                !showPassword
              )}

              {renderInput(
                'Shop Name',
                formData.shopName,
                (text) => setFormData({ ...formData, shopName: text }),
                'Enter your shop name'
              )}

              {renderInput(
                'Address',
                formData.address,
                (text) => setFormData({ ...formData, address: text }),
                'Enter your address'
              )}

              {renderInput(
                'Pincode',
                formData.pincode,
                (text) => setFormData({ ...formData, pincode: text }),
                'Enter your pincode',
                'numeric',
                false,
                6
              )}

            
            
            {/* Terms and Conditions - External Link Version */}
<View className="flex-row items-center mt-4 mb-6">
  <TouchableOpacity
    onPress={() => setAcceptTerms(!acceptTerms)}
    className="mr-2"
  >
    <Ionicons
      name={acceptTerms ? 'checkbox' : 'square-outline'}
      size={24}
      color={acceptTerms ? '#3B82F6' : '#9CA3AF'}
    />
  </TouchableOpacity>
  <Text className="text-gray-600 flex-1">
    I agree to the{' '}
    <TouchableOpacity
      onPress={() => Linking.openURL('https://ratna.digital/terms')}
    >
      <Text className="text-blue-500 underline">Terms and Conditions</Text>
    </TouchableOpacity>
  </Text>
</View>

              {/* Sign Up Button */}
              <TouchableOpacity
                className={`w-full py-4 rounded-xl ${
                  loading ? 'bg-[#EBA05C]' : 'bg-[#E86A2B]'
                } shadow-lg`}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-base">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View className="flex-row justify-center mt-6">
                <Text className="text-gray-600">Already have an account? </Text>
                <Link href="/(auth)/sign-in">
                  <Text className="text-[#E86A2B] font-semibold">Sign In</Text>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
      <Toast />
    </SafeAreaView>
  );
};

export default SignUp;