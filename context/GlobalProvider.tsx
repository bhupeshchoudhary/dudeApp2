import React, { createContext, useContext, useEffect, useState, Context } from "react";
import { getCurrentUser } from "../lib/handleAuth";
import { Models } from "react-native-appwrite";
import Toast from 'react-native-toast-message'; // Step 1: Import Toast
import { NotificationProvider } from './NotificationProvider';

// Define the context value type
interface GlobalContextType {
  isLogged: boolean;
  setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
  user: Models.User<Models.Preferences> | null;
  setUser: React.Dispatch<React.SetStateAction<Models.User<Models.Preferences> | null>>;
  loading: boolean;
}

// Create context with proper type
const GlobalContext: Context<GlobalContextType | undefined> = createContext<GlobalContextType | undefined>(undefined);

// Type-safe custom hook
export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};

// Type the provider props
interface GlobalProviderProps {
  children: React.ReactNode;
}

const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res) {
          setIsLogged(true);
          setUser(res);
        } else {
          setIsLogged(false);
          setUser(null);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const value: GlobalContextType = {
    isLogged,
    setIsLogged,
    user,
    setUser,
    loading,
  };

  return (
    <GlobalContext.Provider value={value}>
      <NotificationProvider>
        {/* Step 2: Render children (all components wrapped by GlobalProvider) */}
        {children}

        {/* Step 3: Add the Toast component here */}
        <Toast />
      </NotificationProvider>
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;