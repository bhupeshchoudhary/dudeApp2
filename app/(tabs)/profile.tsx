// app/(tabs)/profile.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Share, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { useGlobalContext } from '../../context/GlobalProvider';
import { signOut } from '../../lib/handleAuth';
import { router } from 'expo-router';
import { fetchUserDetails } from '../../lib/handleUser';
import Toast from 'react-native-toast-message';
import { User } from '../../types/userTypes'; // Ensure correct path
import UserIcon from '@expo/vector-icons/FontAwesome6';
// import { UserIcon } from 'lucid'; // Dummy profile icon


interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
}

const ProfileScreen: React.FC = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true; // Prevents state update if component unmounts

    const fetchUser = async () => {
      if (!user?.$id) return;

      console.log("this is user id",user.$id)

      try {
        const details = await fetchUserDetails(user.$id.toString());
        if (isMounted) {
          setUserDetails(details);
        }
      } catch (error) {
        console.log("error in fetch user details",error)
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to fetch user details',
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false; // Cleanup function to prevent memory leaks
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsLogged(false);
      router.replace('/(auth)/sign-in');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Logout failed',
      });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'https://play.google.com/store/apps/details?id=com.sumit9897.dude',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Share failed',
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4B5563" />
        <Text className="text-lg mt-2">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Profile Header */}
      <View className="p-4 border-b border-gray-200">
        <View className="flex-row items-center">
          {userDetails?.profileUrl ? (
            <Image
              source={{ uri: userDetails.profileUrl }}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <View className="w-16 h-16 rounded-full bg-blue-200 justify-center items-center">
              <Text className="text-2xl font-bold text-white">
                {(userDetails?.name || '').charAt(0).toUpperCase() || ''}
              </Text>
            </View>
          )}
          <View className="ml-4">
            <Text className="text-xl font-bold">
              {userDetails?.name || 'No Name'}
            </Text>
            <Text className="text-gray-600">
              {userDetails?.phone || 'No Phone Number'}
            </Text>
            {/* Show Ratana Cash balance */}
            {typeof userDetails?.ratanaCash === 'number' && (
              <Text className="text-green-700 font-semibold mt-1">
                You have {userDetails.ratanaCash} Ratana Cash
              </Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView>
        <MenuItem icon="share-social-outline" title="Share App" onPress={handleShare} />
        <MenuItem icon="document-text-outline" title="My Orders" onPress={() => router.push('/orders' as any)} />
        {/* <MenuItem icon="wallet-outline" title="My Earnings" onPress={() => router.push('/earnings' as any)} /> */}
        {/* <MenuItem icon="people-outline" title="My Referral" onPress={() => router.push('/referral' as any)} /> */}
        <MenuItem icon="notifications-outline" title="Notification Settings" onPress={() => router.push('/notification-settings' as any)} />
        <MenuItem icon="headset-outline" title="Customer Support" onPress={() => router.push('/support' as any)} />
        {/* <MenuItem icon="language-outline" title="Change Language" onPress={() => router.push('/language' as any)} /> */}
        <MenuItem icon="location-outline" title="My Addresses" onPress={() => router.push('/addresses' as any)} />
        <MenuItem icon="document-outline" title="Terms & Conditions" onPress={() => router.push('/terms' as any)} />
        <MenuItem icon="shield-outline" title="Account Privacy" onPress={() => router.push('/privacy' as any)} />
        <MenuItem icon="log-out-outline" title="Logout" onPress={handleLogout} />
      </ScrollView>

      <Text className="text-center text-gray-500 py-4">v1.4.0.0</Text>

      {/* Toast Component */}
      <Toast />
    </SafeAreaView>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress }) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center px-4 py-3 border-b border-gray-100">
    <Ionicons name={icon} size={24} color="#4B5563" />
    <Text className="flex-1 ml-3">{title}</Text>
    <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
  </TouchableOpacity>
);

export default ProfileScreen;
