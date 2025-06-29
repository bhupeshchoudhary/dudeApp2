import { View, SafeAreaView, Text, TouchableOpacity, Dimensions, Image, Animated, ScrollView } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { router, Redirect } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Ionicons } from '@expo/vector-icons';

const Welcome = () => {
  const [screenData, setScreenData] = useState(Dimensions.get("window"));
  const { isLogged } = useGlobalContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };
    const subscription = Dimensions.addEventListener("change", onChange);
    return () => subscription?.remove();
  }, []);

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

  const { width, height } = screenData;
  const isSmallScreen = height < 700;
  const isTablet = width > 768;
  const isLandscape = width > height;

  // Dynamic sizing based on screen size
  const logoSize = isSmallScreen ? 45 : isTablet ? 80 : 60;
  const titleSize = isSmallScreen ? 36 : isTablet ? 60 : 48;
  const subtitleSize = isSmallScreen ? 16 : isTablet ? 22 : 18;
  const featureTextSize = isSmallScreen ? 14 : isTablet ? 20 : 16;
  const buttonTextSize = isSmallScreen ? 16 : isTablet ? 20 : 18;
  const welcomeTextSize = isSmallScreen ? 24 : isTablet ? 36 : 28;
  const descriptionSize = isSmallScreen ? 14 : isTablet ? 18 : 16;

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#F7C873", "#EBA05C", "#E86A2B", "#7C4A1E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1"
        style={{ width, height }}
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingHorizontal: isTablet ? 48 : 24,
            paddingTop: isSmallScreen ? 20 : 48,
            paddingBottom: 24
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Brand Section */}
          <Animated.View 
            className="items-center"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginBottom: isSmallScreen ? 24 : isTablet ? 48 : 32,
              flex: isLandscape ? 0 : 1,
              justifyContent: isLandscape ? 'flex-start' : 'center',
              maxHeight: isSmallScreen ? 120 : 200
            }}
          >
            <View 
              className="bg-[#F7C873]/80 rounded-full border-4 border-[#E86A2B] items-center justify-center"
              style={{
                width: logoSize + 32,
                height: logoSize + 32,
                marginBottom: isSmallScreen ? 12 : 16
              }}
            >
              <Ionicons name="cart" size={logoSize} color="#E86A2B" />
            </View>
            <Text 
              className="text-white font-bold mb-2"
              style={{ fontSize: titleSize, lineHeight: titleSize * 1.2 }}
            >
              Ratana
            </Text>
            <Text 
              className="text-[#7C4A1E] font-semibold text-center"
              style={{ fontSize: subtitleSize }}
            >
              Your Shopping Paradise
            </Text>
          </Animated.View>

          {/* Features Section */}
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginBottom: isSmallScreen ? 20 : 32,
              flex: isLandscape ? 0 : 1,
              justifyContent: 'center'
            }}
          >
            <View 
              className={isLandscape && isTablet ? "flex-row justify-around" : ""}
              style={{ gap: isTablet ? 16 : 12 }}
            >
              <View className="flex-row items-center mb-3">
                <View 
                  className="bg-[#EBA05C]/80 rounded-full mr-3 items-center justify-center"
                  style={{ 
                    width: isSmallScreen ? 32 : 40, 
                    height: isSmallScreen ? 32 : 40 
                  }}
                >
                  <Ionicons 
                    name="shield-checkmark" 
                    size={isSmallScreen ? 16 : 20} 
                    color="#7C4A1E" 
                  />
                </View>
                <Text 
                  className="text-[#7C4A1E] font-semibold flex-1"
                  style={{ fontSize: featureTextSize }}
                >
                  Secure Shopping
                </Text>
              </View>
              <View className="flex-row items-center mb-3">
                <View 
                  className="bg-[#F7C873]/80 rounded-full mr-3 items-center justify-center"
                  style={{ 
                    width: isSmallScreen ? 32 : 40, 
                    height: isSmallScreen ? 32 : 40 
                  }}
                >
                  <Ionicons 
                    name="flash" 
                    size={isSmallScreen ? 16 : 20} 
                    color="#E86A2B" 
                  />
                </View>
                <Text 
                  className="text-[#E86A2B] font-semibold flex-1"
                  style={{ fontSize: featureTextSize }}
                >
                  Fast Delivery
                </Text>
              </View>
              <View className="flex-row items-center">
                <View 
                  className="bg-[#E86A2B]/80 rounded-full mr-3 items-center justify-center"
                  style={{ 
                    width: isSmallScreen ? 32 : 40, 
                    height: isSmallScreen ? 32 : 40 
                  }}
                >
                  <Ionicons 
                    name="gift" 
                    size={isSmallScreen ? 16 : 20} 
                    color="#F7C873" 
                  />
                </View>
                <Text 
                  className="text-[#F7C873] font-semibold flex-1"
                  style={{ fontSize: featureTextSize }}
                >
                  Ratana Cash Rewards
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Welcome Message */}
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginBottom: isSmallScreen ? 24 : 32,
              flex: isLandscape ? 0 : 1,
              justifyContent: 'center'
            }}
          >
            <Text 
              className="text-white font-bold mb-4 text-center"
              style={{ 
                fontSize: welcomeTextSize, 
                lineHeight: welcomeTextSize * 1.3,
                marginBottom: isSmallScreen ? 12 : 16
              }}
            >
              Welcome to Ratana!
            </Text>
            <Text 
              className="text-[#7C4A1E] text-center leading-relaxed"
              style={{ 
                fontSize: descriptionSize,
                lineHeight: descriptionSize * 1.5,
                paddingHorizontal: isTablet ? 40 : 0
              }}
            >
              Your one-stop destination for amazing deals. Shop smart, earn rewards, and enjoy a seamless shopping experience.
            </Text>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginTop: 'auto',
              paddingTop: isSmallScreen ? 16 : 24
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-up")}
              className="bg-[#E86A2B] rounded-xl shadow-lg"
              style={{
                paddingVertical: isSmallScreen ? 14 : isTablet ? 20 : 16,
                marginBottom: isSmallScreen ? 12 : 16,
                marginHorizontal: isTablet ? width * 0.1 : 0
              }}
              activeOpacity={0.8}
            >
              <Text 
                className="text-white font-semibold text-center"
                style={{ fontSize: buttonTextSize }}
              >
                Get Started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-in")}
              className="bg-[#7C4A1E]/80 rounded-xl"
              style={{
                paddingVertical: isSmallScreen ? 14 : isTablet ? 20 : 16,
                marginHorizontal: isTablet ? width * 0.1 : 0
              }}
              activeOpacity={0.8}
            >
              <Text 
                className="text-[#F7C873] font-semibold text-center"
                style={{ fontSize: buttonTextSize }}
              >
                I already have an account
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Welcome;