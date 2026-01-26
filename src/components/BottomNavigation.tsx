import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabConfig {
    key: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconOutline: keyof typeof Ionicons.glyphMap;
    label: string;
    activeColor: string;
    activeBg: string;
}

const tabs: TabConfig[] = [
    { key: 'home', icon: 'home', iconOutline: 'home-outline', label: 'Inicio', activeColor: '#09A4B5', activeBg: '#EDE9FE' },
    { key: 'cases', icon: 'briefcase', iconOutline: 'briefcase-outline', label: 'Casos', activeColor: '#09A4B5', activeBg: '#EDE9FE' },
    { key: 'chat', icon: 'chatbubble-ellipses', iconOutline: 'chatbubble-ellipses-outline', label: 'Chat', activeColor: '#09A4B5', activeBg: '#FFF7ED' },
    { key: 'calendar', icon: 'calendar', iconOutline: 'calendar-outline', label: 'Citas', activeColor: '#09A4B5', activeBg: '#FFF7ED' },
    { key: 'settings', icon: 'settings', iconOutline: 'settings-outline', label: 'Ajustes', activeColor: '#09A4B5', activeBg: '#EDE9FE' },
];

interface BottomNavigationProps {
    activeTab?: string;
    onTabPress: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
    activeTab = 'home',
    onTabPress
}) => {
    const scaleAnims = {
        home: React.useRef(new Animated.Value(1)).current,
        cases: React.useRef(new Animated.Value(1)).current,
        chat: React.useRef(new Animated.Value(1)).current,
        calendar: React.useRef(new Animated.Value(1)).current,
        settings: React.useRef(new Animated.Value(1)).current,
    };

    const handlePress = (tab: string) => {
        const anim = scaleAnims[tab as keyof typeof scaleAnims];
        if (anim) {
            Animated.sequence([
                Animated.spring(anim, {
                    toValue: 0.9,
                    useNativeDriver: true,
                }),
                Animated.spring(anim, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true,
                }),
            ]).start();
        }
        onTabPress(tab);
    };

    return (
        <View style={styles.container}>
            <View style={styles.bottomNav}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={styles.navItem}
                            onPress={() => handlePress(tab.key)}
                            activeOpacity={0.7}
                        >
                            <Animated.View
                                style={[
                                    styles.iconContainer,
                                    isActive && { backgroundColor: tab.activeBg },
                                    { transform: [{ scale: scaleAnims[tab.key as keyof typeof scaleAnims] }] }
                                ]}
                            >
                                <Ionicons
                                    name={isActive ? tab.icon : tab.iconOutline}
                                    size={28}
                                    color={isActive ? tab.activeColor : '#9CA3AF'}
                                />
                            </Animated.View>
                            <Text
                                style={[
                                    styles.navLabel,
                                    isActive && { color: tab.activeColor, fontWeight: '700' }
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        zIndex: 50,
    },
    bottomNav: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
        gap: 0,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    navLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#9CA3AF',
        marginTop: 1,
    },
});

export default BottomNavigation;