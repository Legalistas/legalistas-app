
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, StatusBar } from 'react-native';
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../styles/typography";
import BottomNavigation from "../components/BottomNavigation";

export default function DashboardScreen() {
    const { userInfo, logout } = useAuth();

    if (!userInfo) return null;

    // Variable
    const fullName = userInfo.name;
    const [lastName, firstName] = fullName.split(" ");

    return (
        <View style={styles.container}>
            {/* Header con fondo y patrón */}
            <View style={styles.topBackground}>
                <Image
                    source={require("../../assets/grid-bg.png")}
                    style={styles.backgroundPattern}
                />

                <View style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require("../../assets/logo.png")}
                                style={styles.logoImage}
                            />
                        </View>
                        <TouchableOpacity style={styles.profileButton}>
                            <Image
                                source={{ uri: userInfo.image }}
                                style={styles.profileImage}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.greetingSection}>
                        <Text style={styles.greeting}>¡Hola, {lastName}!</Text>
                        <Text style={styles.subtitle}>Tienes 2 asuntos legales pendientes hoy.</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.main}
                contentContainerStyle={styles.mainContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.primaryButton}>
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
                        <Text style={styles.primaryButtonText}>NUEVA CONSULTA</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton}>
                        <Ionicons name="document-outline" size={24} color="#000" />
                        <Text style={styles.secondaryButtonText}>SUBIR DOCUMENTO</Text>
                    </TouchableOpacity>
                </View>

                {/* Próximas Citas */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Agenda</Text>
                        <TouchableOpacity>
                            <Text style={styles.sectionLink}>Ver todas</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.appointmentCard}>
                        <View style={styles.dateBox}>
                            <Text style={styles.dateMonth}>OCT</Text>
                            <Text style={styles.dateDay}>24</Text>
                        </View>
                        <View style={styles.appointmentContent}>
                            <Text style={styles.appointmentTitle}>Revisión de Contrato Alquiler</Text>
                            <Text style={styles.appointmentTime}>⏰ 10:30 AM • Videollamada</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
                    </TouchableOpacity>
                </View>

                {/* Mis Casos */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Mis Casos</Text>
                        <TouchableOpacity>
                            <Text style={styles.sectionLink}>Historial</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Case 1 */}
                    <View style={styles.caseCard}>
                        <View style={styles.caseHeader}>
                            <View>
                                <View style={styles.caseBadge}>
                                    <Text style={styles.caseBadgeText}>ART #93421</Text>
                                </View>
                                <Text style={styles.caseTitle}>Accidente Laboral - ART</Text>
                            </View>
                            <Text style={styles.moreIcon}>⋯</Text>
                        </View>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: '65%' }]} />
                            </View>
                            <Text style={styles.progressText}>65%</Text>
                        </View>
                        <View style={styles.caseFooter}>
                            <View style={styles.avatarGroup}>
                                <Image
                                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgZpOcNMQTP1GjMwYYlqIKOLxMqZ1r-RmnmSuZfLRzRYdceDo2hb1kEkWov9vDdvvByXTvt0-SKiaMd6WDQeFC98gizrydjS_8RPQUxLw6JrdNtQgyJT_RD0lPElc4N2BxeMq49MPXTN2uC1JvsY_ZqUmQsuLkKKc-VaHJb6j1ytZuNdo_IWkAH0x7YKZ8Hw2_lJrYQOTAiv44MpkGYlfc3Pv4wr_VN0vsRH9J85W819EeNzj6qsF1NhbSo9B-ZiTwB8fOg7HdCFVq' }}
                                    style={styles.avatar}
                                />
                                <View style={styles.avatarMore}>
                                    <Text style={styles.avatarMoreText}>+1</Text>
                                </View>
                            </View>
                            <Text style={styles.lastMessage}>Último mensaje hoy a las 12:45</Text>
                        </View>
                    </View>

                    {/* Case 2 */}
                    <View style={[styles.caseCard, styles.caseCardInactive]}>
                        <View style={styles.caseHeader}>
                            <View>
                                <View style={[styles.caseBadge, styles.caseBadgeLaboral]}>
                                    <Text style={styles.caseBadgeTextLaboral}>LABORAL #82103</Text>
                                </View>
                                <Text style={styles.caseTitle}>Impugnación de Despido</Text>
                            </View>
                            <Text style={styles.moreIcon}>⋯</Text>
                        </View>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, styles.progressFillLaboral, { width: '25%' }]} />
                            </View>
                            <Text style={styles.progressText}>25%</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* FAB - Por encima del menú */}
            <TouchableOpacity style={styles.fab}>
                {/* <Text style={styles.fabIcon}>+</Text> */}
                <Ionicons name="chatbubble-ellipses" size={32} color="#fff" />
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    topBackground: {
        backgroundColor: '#1C2434',
        paddingTop: 60,
        paddingBottom: 80,
        paddingHorizontal: 24,
        position: 'relative',
    },
    backgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.65,
    },
    headerContent: {
        position: 'relative',
        zIndex: 1,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoImage: {
        width: 140,
        height: 32,
        resizeMode: 'contain',
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#334155',
        overflow: 'hidden',
        backgroundColor: '#1e293b',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    greetingSection: {
        gap: 4,
    },
    greeting: {
        ...typography.h1,
        color: '#fff',
    },
    subtitle: {
        ...typography.bodySmall,
        color: '#94a3b8',
    },
    main: {
        flex: 1,
        marginTop: -48,
        paddingHorizontal: 24,
    },
    mainContent: {
        paddingBottom: 100,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#09A4B5',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'column',      // 👈 IMPORTANTE
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#09A4B5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    primaryButtonText: {
        ...typography.labelSmall,
        color: '#fff',
    },
    secondaryButtonText: {
        ...typography.labelSmall,
        color: '#334155',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        ...typography.h5,
        color: '#0f172a',
    },
    sectionLink: {
        ...typography.bodySmall,
        color: '#09A4B5',
    },
    appointmentCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    dateBox: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        width: 48,
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateMonth: {
        ...typography.captionSmall,
        color: '#09A4B5',
    },
    dateDay: {
        ...typography.h4,
        color: '#09A4B5',
    },
    appointmentContent: {
        flex: 1,
    },
    appointmentTitle: {
        ...typography.bodySmall,
        color: '#0f172a',
    },
    appointmentTime: {
        ...typography.caption,
        color: '#64748b',
        marginTop: 4,
    },
    chevron: {
        fontSize: 24,
        color: '#cbd5e1',
    },
    caseCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 12,
    },
    caseCardInactive: {
        opacity: 0.75,
    },
    caseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    caseBadge: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    caseBadgeText: {
        ...typography.labelSmall,
        color: '#09A4B5',
    },
    caseBadgeLaboral: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
    },
    caseBadgeTextLaboral: {
        color: '#f59e0b',
    },
    caseTitle: {
        ...typography.h6,
        color: '#0f172a',
        marginTop: 8,
    },
    moreIcon: {
        fontSize: 20,
        color: '#94a3b8',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#09A4B5',
        borderRadius: 4,
    },
    progressFillLaboral: {
        backgroundColor: '#f59e0b',
    },
    progressText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
    },
    caseFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    avatarGroup: {
        flexDirection: 'row',
        marginLeft: -8,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarMore: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -8,
    },
    avatarMoreText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    lastMessage: {
        fontSize: 10,
        color: '#94a3b8',
    },
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 24,
        width: 56,
        height: 56,
        backgroundColor: '#09A4B5',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 12,
        zIndex: 100,
    },
    fabIcon: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '300',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 50,
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
    },
    navIcon: {
        fontSize: 24,
        opacity: 0.4,
    },
    navIconActive: {
        fontSize: 24,
        opacity: 1,
    },
    navLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: '#94a3b8',
    },
    navLabelActive: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#09A4B5',
    },
    homeIndicator: {
        position: 'absolute',
        bottom: 8,
        left: '50%',
        marginLeft: -64,
        width: 128,
        height: 6,
        backgroundColor: '#cbd5e1',
        borderRadius: 3,
        zIndex: 60,
    },
});
