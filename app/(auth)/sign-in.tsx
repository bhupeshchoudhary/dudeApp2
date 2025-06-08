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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, Redirect } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import { signIn, getCurrentUser } from '@/lib/handleAuth';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SignIn = () => {  
  const { setUser, setIsLogged, isLogged } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already logged in
  if (isLogged) {
    return <Redirect href="/home" />;
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handleLogin = async () => {
    if (!phone || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields',
      });
      return;
    }

    if (!validatePhone(phone)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid 10-digit phone number',
      });
      return;
    }

    setLoading(true);
    try {
      await signIn(phone, password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLogged(true);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Login successful',
      });
      router.replace("/home");
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Login failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

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
            contentContainerClassName="flex-grow justify-center"
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 py-8 flex-1 justify-center">
              {/* Header */}
              <View className="items-center mb-8">
                <Image
                  source={require('../../assets/images/ratana.jpg')}
                  className="w-20 h-20 rounded-full mb-4"
                />
                <Text className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome Back!
                </Text>
                <Text className="text-gray-600 text-center">
                  Sign in to continue to your account
                </Text>
              </View>

              {/* Form Container */}
              <View className="space-y-4">
                {/* Phone Input */}
                <View>
                  <Text className="text-sm font-medium mb-1 text-gray-600">
                    Phone Number
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      maxLength={10}
                      autoCapitalize="none"
                      placeholderTextColor="#9CA3AF"
                    />
                    {phone.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setPhone('')}
                        className="absolute right-3 top-3"
                      >
                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Password Input */}
                <View>
                  <Text className="text-sm font-medium mb-1 text-gray-600">
                    Password
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm"
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3"
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity className="self-end">
                  <Text className="text-blue-500 font-medium">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                  className={`w-full py-4 rounded-xl ${
                    loading ? 'bg-blue-400' : 'bg-blue-500'
                  } shadow-lg`}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center font-semibold text-base">
                      Sign In
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View className="flex-row justify-center mt-4">
                  <Text className="text-gray-600">Don't have an account? </Text>
                  <Link href="/(auth)/sign-up">
                    <Text className="text-blue-500 font-semibold">Sign Up</Text>
                  </Link>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
      <Toast />
    </SafeAreaView>
  );
};

export default SignIn;
