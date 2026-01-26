import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Linking } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../styles/typography";

interface AboutScreenProps {
    onBack?: () => void;
    onNavigateToWebView?: (url: string, title: string) => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onBack, onNavigateToWebView }) => {
    const handleOpenUrl = (url: string) => {
        Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {onBack && (
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>Acerca de</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Logo and App Info */}
                <View style={styles.logoSection}>
                    <Image
                        source={require("../../assets/logo.png")}
                        style={styles.logo}
                    />
                    <Text style={styles.appName}>Legalistas</Text>
                    <Text style={styles.version}>Versión 1.0.0</Text>
                    <Text style={styles.tagline}>Tu aliado legal de confianza</Text>
                </View>

                {/* Mission Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="bulb-outline" size={24} color="#09A4B5" />
                        <Text style={styles.cardTitle}>Nuestra Misión</Text>
                    </View>
                    <Text style={styles.cardText}>
                        En Legalistas, facilitamos el acceso a servicios legales de calidad, 
                        conectando a personas con abogados especializados de manera simple y transparente. 
                        Nuestra misión es democratizar la justicia y hacer que tus derechos estén siempre protegidos.
                    </Text>
                </View>

                {/* Services Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="briefcase-outline" size={24} color="#09A4B5" />
                        <Text style={styles.cardTitle}>Nuestros Servicios</Text>
                    </View>
                    <View style={styles.servicesList}>
                        <ServiceItem icon="car-outline" text="Accidentes de tránsito" />
                        <ServiceItem icon="construct-outline" text="Accidentes de trabajo" />
                        <ServiceItem icon="card-outline" text="Jubilaciones" />
                        <ServiceItem icon="home-outline" text="Sucesiones" />
                        <ServiceItem icon="warning-outline" text="Daños y materiales" />
                        <ServiceItem icon="document-text-outline" text="Despidos" />
                    </View>
                </View>

                {/* Features Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="star-outline" size={24} color="#09A4B5" />
                        <Text style={styles.cardTitle}>¿Por qué elegirnos?</Text>
                    </View>
                    <View style={styles.featuresList}>
                        <FeatureItem 
                            icon="shield-checkmark-outline" 
                            title="Profesionales Verificados"
                            description="Abogados con experiencia comprobada"
                        />
                        <FeatureItem 
                            icon="time-outline" 
                            title="Seguimiento en Tiempo Real"
                            description="Mantente informado del estado de tu caso"
                        />
                        <FeatureItem 
                            icon="chatbubble-ellipses-outline" 
                            title="Comunicación Directa"
                            description="Consulta con tu abogado cuando lo necesites"
                        />
                        <FeatureItem 
                            icon="document-lock-outline" 
                            title="Seguridad y Privacidad"
                            description="Tus datos están protegidos"
                        />
                    </View>
                </View>

                {/* Contact Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="call-outline" size={24} color="#09A4B5" />
                        <Text style={styles.cardTitle}>Contacto</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.contactItem}
                        onPress={() => handleOpenUrl('mailto:contacto@legalistas.ar')}
                    >
                        <Ionicons name="mail-outline" size={20} color="#64748b" />
                        <Text style={styles.contactText}>contacto@legalistas.ar</Text>
                        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.contactItem}
                        onPress={() => handleOpenUrl('https://www.legalistas.ar')}
                    >
                        <Ionicons name="globe-outline" size={20} color="#64748b" />
                        <Text style={styles.contactText}>www.legalistas.ar</Text>
                        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.contactItem}
                        onPress={() => handleOpenUrl('https://instagram.com/legalistas')}
                    >
                        <Ionicons name="logo-instagram" size={20} color="#64748b" />
                        <Text style={styles.contactText}>@legalistas</Text>
                        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                    </TouchableOpacity>
                </View>

                {/* Legal Links */}
                <View style={styles.legalLinks}>
                    <TouchableOpacity 
                        style={styles.legalLink}
                        onPress={() => onNavigateToWebView?.('https://legalistas.ar/terminos-condiciones', 'Términos y Condiciones')}
                    >
                        <Text style={styles.legalLinkText}>Términos y Condiciones</Text>
                    </TouchableOpacity>
                    <View style={styles.separator} />
                    <TouchableOpacity 
                        style={styles.legalLink}
                        onPress={() => onNavigateToWebView?.('https://legalistas.ar/politica-privacidad', 'Política de Privacidad')}
                    >
                        <Text style={styles.legalLinkText}>Política de Privacidad</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 Legalistas. Todos los derechos reservados.</Text>
                    <Text style={styles.footerSubtext}>Hecho con ❤️ en Argentina</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

interface ServiceItemProps {
    icon: string;
    text: string;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ icon, text }) => (
    <View style={styles.serviceItem}>
        <Ionicons name={icon as any} size={20} color="#09A4B5" />
        <Text style={styles.serviceText}>{text}</Text>
    </View>
);

interface FeatureItemProps {
    icon: string;
    title: string;
    description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
    <View style={styles.featureItem}>
        <View style={styles.featureIconContainer}>
            <Ionicons name={icon as any} size={24} color="#09A4B5" />
        </View>
        <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
        </View>
    </View>
);

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
        ...typography.h4,
        color: '#ffffff',
        flex: 1,
    },
    content: {
        flex: 1,
    },
    logoSection: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
    },
    logo: {
        width: 180,
        height: 48,
        resizeMode: 'contain',
        marginBottom: 16,
    },
    appName: {
        ...typography.h2,
        color: '#1C2434',
        marginBottom: 4,
    },
    version: {
        ...typography.bodySmall,
        color: '#94a3b8',
        marginBottom: 8,
    },
    tagline: {
        ...typography.h6,
        color: '#09A4B5',
    },
    card: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    cardTitle: {
        ...typography.h5,
        color: '#1C2434',
    },
    cardText: {
        ...typography.body,
        color: '#64748b',
        lineHeight: 24,
    },
    servicesList: {
        gap: 16,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    serviceText: {
        ...typography.body,
        color: '#1C2434',
    },
    featuresList: {
        gap: 20,
    },
    featureItem: {
        flexDirection: 'row',
        gap: 16,
    },
    featureIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e6f7f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        ...typography.h6,
        color: '#1C2434',
        marginBottom: 4,
    },
    featureDescription: {
        ...typography.bodySmall,
        color: '#64748b',
        lineHeight: 20,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    contactText: {
        ...typography.body,
        flex: 1,
        color: '#1C2434',
    },
    legalLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        marginHorizontal: 20,
    },
    legalLink: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    legalLinkText: {
        ...typography.caption,
        color: '#09A4B5',
    },
    separator: {
        width: 1,
        height: 16,
        backgroundColor: '#cbd5e1',
    },
    footer: {
        alignItems: 'center',
        marginTop: 24,
        paddingHorizontal: 20,
    },
    footerText: {
        ...typography.caption,
        color: '#94a3b8',
        marginBottom: 4,
    },
    footerSubtext: {
        ...typography.captionSmall,
        color: '#cbd5e1',
    },
});

export default AboutScreen;
