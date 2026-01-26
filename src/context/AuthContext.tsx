import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
    userToken: string | null;
    userInfo: any | null;
    loading: boolean;
    login: (token: string, userInfo?: any) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🔐 AuthContext: Checking token...');
        const checkToken = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const savedUserInfo = await AsyncStorage.getItem("userInfo");
                
                console.log('🎫 Token found:', token ? 'YES' : 'NO');
                
                if (token) {
                    setUserToken(token);
                    
                    // Cargar info del usuario guardada
                    if (savedUserInfo) {
                        try {
                            setUserInfo(JSON.parse(savedUserInfo));
                        } catch (error) {
                            console.log('❌ Error parsing user info:', error);
                        }
                    }
                }
                
                setLoading(false);
                console.log('✅ AuthContext loading finished');
            } catch (error) {
                console.log('❌ Error checking token:', error);
                setLoading(false);
            }
        };
        checkToken();
    }, []);

    const login = async (token: string, userData?: any) => {
        try {
            await AsyncStorage.setItem("token", token);
            setUserToken(token);
            
            if (userData) {
                await AsyncStorage.setItem("userInfo", JSON.stringify(userData));
                setUserInfo(userData);
            }
            
            console.log('✅ User logged in successfully');
        } catch (error) {
            console.log('❌ Error saving login data:', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("userInfo");
            setUserToken(null);
            setUserInfo(null);
            console.log('✅ User logged out successfully');
        } catch (error) {
            console.log('❌ Error during logout:', error);
        }
    };

    const isAuthenticated = !!userToken;

    const value: AuthContextType = {
        userToken,
        userInfo,
        loading,
        login,
        logout,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
