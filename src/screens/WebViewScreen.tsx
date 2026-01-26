import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../styles/typography";

interface WebViewScreenProps {
    url: string;
    title: string;
    onBack: () => void;
}

const WebViewScreen: React.FC<WebViewScreenProps> = ({ url, title, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* WebView */}
            <WebView
                source={{ uri: url }}
                style={styles.webview}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setError(true);
                }}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#09A4B5" />
                        <Text style={styles.loadingText}>Cargando...</Text>
                    </View>
                )}
            />

            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={48} color="#e11d48" />
                    <Text style={styles.errorText}>No se pudo cargar la página</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => {
                            setError(false);
                            setLoading(true);
                        }}
                    >
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#1C2434',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...typography.h5,
        color: '#ffffff',
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        gap: 16,
    },
    loadingText: {
        ...typography.h6,
        color: '#64748b',
    },
    errorContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 40,
        gap: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#e11d48',
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#09A4B5',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 8,
    },
    retryButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
    },
});

export default WebViewScreen;
