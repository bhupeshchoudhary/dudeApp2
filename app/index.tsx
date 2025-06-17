import { View, SafeAreaView, Text, TouchableOpacity, Dimensions, Image, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { router, Redirect } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Ionicons } from '@expo/vector-icons';

const Welcome = () => {
  const { width, height } = Dimensions.get("window");
  const { isLogged } = useGlobalContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if(isLogged) {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#F7C873", "#EBA05C", "#E86A2B", "#7C4A1E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1"
        style={{ width, height }}
      >
        <View className="flex-1 px-6 pt-12">
          {/* Logo and Brand Section */}
          <Animated.View 
            className="items-center mb-8"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View className="bg-[#F7C873]/80 p-6 rounded-full mb-4 border-4 border-[#E86A2B]">
              <Ionicons name="cart" size={60} color="#E86A2B" />
            </View>
            <Text className="text-white text-5xl font-bold mb-2">Ratana</Text>
            <Text className="text-[#7C4A1E] text-lg font-semibold">Your Shopping Paradise</Text>
          </Animated.View>

          {/* Features Section */}
          <Animated.View 
            className="mb-8"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-[#EBA05C]/80 p-2 rounded-full mr-3">
                <Ionicons name="shield-checkmark" size={20} color="#7C4A1E" />
              </View>
              <Text className="text-[#7C4A1E] text-lg font-semibold">Secure Shopping</Text>
            </View>
            <View className="flex-row items-center mb-4">
              <View className="bg-[#F7C873]/80 p-2 rounded-full mr-3">
                <Ionicons name="flash" size={20} color="#E86A2B" />
              </View>
              <Text className="text-[#E86A2B] text-lg font-semibold">Fast Delivery</Text>
            </View>
            <View className="flex-row items-center">
              <View className="bg-[#E86A2B]/80 p-2 rounded-full mr-3">
                <Ionicons name="gift" size={20} color="#F7C873" />
              </View>
              <Text className="text-[#F7C873] text-lg font-semibold">Ratana Cash Rewards</Text>
            </View>
          </Animated.View>

          {/* Welcome Message */}
          <Animated.View 
            className="mb-8"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <Text className="text-white text-3xl font-bold mb-4">
              Welcome to Ratana!
            </Text>
            <Text className="text-[#7C4A1E] text-lg leading-6 mb-4">
              Your one-stop destination for amazing deals. Shop smart, earn rewards, and enjoy a seamless shopping experience.
            </Text>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View 
            className="mt-auto mb-8 "
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-up")}
              className="bg-[#E86A2B] py-4 rounded-xl shadow-lg mb-4"
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg font-semibold text-center">
                Get Started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-in")}
              className="bg-[#7C4A1E]/80 py-4 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-[#F7C873] text-lg font-semibold text-center">
                I already have an account
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Welcome;