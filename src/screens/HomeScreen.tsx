import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Modal, BackHandler, Alert, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../styles/typography";
import BottomNavigation from "../components/BottomNavigation";
import ApiService from "../services/ApiService";
import { getStageColors, getStageIconName, getStageName, getProgressFromStage } from "../utils/caseStages";
import { getRelativeTime } from "../utils/formatters";
import { getServiceName } from "../utils/serviceTypes";

interface HomeScreenProps {
    onNavigateToDetail?: (caseId: string | number) => void;
    onNewConsultation?: () => void;
    onUploadDocument?: () => void;
}

export default function HomeScreen({ onNavigateToDetail, onNewConsultation, onUploadDocument }: HomeScreenProps = {}) {
    const navigation = useNavigation();
    const { userInfo, logout } = useAuth();
    const [cases, setCases] = useState<any[]>([]);
    const [loadingCases, setLoadingCases] = useState(true);
    const [errorCases, setErrorCases] = useState<string | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const handleMinimizeApp = () => {
        BackHandler.exitApp();
    };

    const handleLogout = async () => {
        setShowProfileModal(false);
        await logout();
    };

    const handleChangePassword = () => {
        setShowProfileModal(false);
        // TODO: Implementar cambio de contraseña
    };

    const handleCasePress = (caseId: string | number) => {
        if (onNavigateToDetail) {
            onNavigateToDetail(caseId);
        } else {
            (navigation as any).navigate('CaseDetail', { caseId });
        }
    };

    useEffect(() => {
        const fetchCases = async () => {
            if (!userInfo?.id) return;

            setLoadingCases(true);
            setErrorCases(null);
            try {
                const res = await ApiService.getCases(userInfo.id, 1, 5);
                if (res.success && res.data?.data && Array.isArray(res.data.data)) {
                    setCases(res.data.data);
                } else if (res.success && Array.isArray(res.data)) {
                    setCases(res.data);
                } else if (res.success && res.data?.results) {
                    setCases(res.data.results);
                } else {
                    setCases([]);
                    setErrorCases(res.error || res.message || "No se pudieron cargar las causas");
                }
            } catch (e: any) {
                setErrorCases(e.message || "Error de red");
            } finally {
                setLoadingCases(false);
            }
        };
        fetchCases();
    }, [userInfo?.id]);

    if (!userInfo) return null;

    const fullName = userInfo.name;
    const [lastName, firstName] = fullName.split(" ");

    console.log("User Info:", userInfo);

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
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.profileButton} onPress={() => setShowProfileModal(true)}>
                                <Image
                                    source={{ uri: userInfo.image }}
                                    style={styles.profileImage}
                                />
                            </TouchableOpacity>
                        </View>
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
                    <TouchableOpacity style={styles.primaryButton} onPress={onNewConsultation}>
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
                        <Text style={styles.primaryButtonText}>NUEVA CONSULTA</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={onUploadDocument}>
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
                    {loadingCases ? (
                        <ActivityIndicator size="small" color="#09A4B5" style={{ marginVertical: 16 }} />
                    ) : errorCases ? (
                        <View style={styles.errorBox}>
                            <Ionicons name="alert-circle" size={20} color="#e11d48" style={{ marginRight: 8 }} />
                            <Text style={styles.errorText}>{errorCases}</Text>
                        </View>
                    ) : cases.length === 0 ? (
                        <Text style={{ color: '#64748b', marginVertical: 16 }}>No tienes causas registradas.</Text>
                    ) : (
                        cases.map((item, idx) => {
                            const stageColors = getStageColors(item.stageId);
                            const stageIcon = getStageIconName(item.stageId);
                            const stageName = getStageName(item.stageId);
                            const progress = item.progress || getProgressFromStage(item.stageId);
                            const serviceName = getServiceName(item.servicesId);

                            return (
                                <TouchableOpacity
                                    key={item.id || idx}
                                    style={styles.caseCard}
                                    onPress={() => handleCasePress(item.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.caseHeader}>
                                        <View>
                                            <View style={[styles.caseBadge, { backgroundColor: stageColors.background, borderColor: stageColors.border }]}>
                                                <Ionicons name={stageIcon as any} size={12} color={stageColors.text} style={{ marginRight: 4 }} />
                                                <Text style={[styles.caseBadgeText, { color: stageColors.text }]}>{item.id || item.numero || 'SIN CÓDIGO'} • {serviceName}</Text>
                                            </View>
                                            <Text style={styles.caseTitle}>{item.title || item.titulo || 'Sin título'}</Text>
                                            <Text style={[styles.stageName, { color: stageColors.text }]}>{stageName}</Text>
                                        </View>
                                        <Text style={styles.moreIcon}>⋯</Text>
                                    </View>
                                    <View style={styles.progressContainer}>
                                        <View style={styles.progressBar}>
                                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                                        </View>
                                        <Text style={styles.progressText}>{progress}%</Text>
                                    </View>
                                    <View style={styles.caseFooter}>
                                        <View style={styles.avatarGroup}>
                                            {/* Avatar del responsable o grupo, si existe */}
                                            {item.responsibleLawyer?.image ? (
                                                <Image source={{ uri: `https://backend.legalistas.ar${item.responsibleLawyer.image}` }} style={styles.avatar} />
                                            ) : (
                                                <View style={[styles.avatar, { backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }]}>
                                                    <Ionicons name="person" size={16} color="#94a3b8" />
                                                </View>
                                            )}
                                            <Text style={styles.responsibleName}>{item.responsibleLawyer?.name || 'Sin asignar'}</Text>
                                        </View>
                                        <Text style={styles.lastMessage}>{getRelativeTime(item.updatedAt || item.createdAt)}</Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        })
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* FAB - Por encima del menú */}
            <TouchableOpacity style={styles.fab}>
                <Ionicons name="chatbubble-ellipses" size={32} color="#fff" />
            </TouchableOpacity>

            {/* Modal de perfil */}
            <Modal
                visible={showProfileModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowProfileModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowProfileModal(false)}
                >
                    <Pressable style={styles.profileModalContainer} onPress={() => {}}>
                        <View style={styles.profileModalHeader}>
                            <Image
                                source={{ uri: userInfo.image }}
                                style={styles.profileModalImage}
                            />
                            <Text style={styles.profileModalName}>{userInfo.name}</Text>
                            <Text style={styles.profileModalEmail}>{userInfo.email}</Text>
                        </View>

                        <View style={styles.profileModalOptions}>
                            <TouchableOpacity
                                style={styles.profileModalOption}
                                onPress={() => {
                                    console.log('Cambiar contraseña presionado');
                                    setShowProfileModal(false);
                                }}
                                activeOpacity={0.6}
                            >
                                <Ionicons name="key-outline" size={22} color="#1C2434" />
                                <Text style={styles.profileModalOptionText}>Cambiar contraseña</Text>
                                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.profileModalOption}
                                onPress={() => {
                                    console.log('Minimizar app presionado');
                                    setShowProfileModal(false);
                                    BackHandler.exitApp();
                                }}
                                activeOpacity={0.6}
                            >
                                <Ionicons name="remove-outline" size={22} color="#1C2434" />
                                <Text style={styles.profileModalOptionText}>Minimizar app</Text>
                                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.profileModalOption, styles.profileModalOptionLogout]}
                                onPress={async () => {
                                    console.log('Cerrar sesión presionado');
                                    setShowProfileModal(false);
                                    await logout();
                                }}
                                activeOpacity={0.6}
                            >
                                <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                                <Text style={styles.profileModalOptionTextLogout}>Cerrar sesión</Text>
                                <Ionicons name="chevron-forward" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.profileModalCloseButton}
                            onPress={() => setShowProfileModal(false)}
                            activeOpacity={0.6}
                        >
                            <Text style={styles.profileModalCloseText}>Cancelar</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
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
        overflow: 'hidden',
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
        opacity: 0.05,
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
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
    stageName: {
        ...typography.caption,
        marginTop: 4,
        opacity: 0.8,
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
        ...typography.caption,
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
        alignItems: 'center',
        gap: 8,
        marginLeft: -8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 99999,
        borderWidth: 2,
        borderColor: '#fff',
        objectFit: 'contain',
    },
    responsibleName: {
        ...typography.caption,
        color: '#0f172a',
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
        ...typography.captionSmall,
        color: '#94a3b8',
    },
    fab: {
        position: 'absolute',
        bottom: 120,
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
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginVertical: 16,
    },
    errorText: {
        color: '#e11d48',
        fontSize: 14,
        fontWeight: '500',
    },
    // Profile Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    profileModalContainer: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    profileModalHeader: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    profileModalImage: {
        width: 72,
        height: 72,
        borderRadius: 36,
        marginBottom: 12,
        borderWidth: 3,
        borderColor: '#09A4B5',
    },
    profileModalName: {
        ...typography.h5,
        color: '#1C2434',
        marginBottom: 4,
    },
    profileModalEmail: {
        ...typography.bodySmall,
        color: '#64748b',
    },
    profileModalOptions: {
        paddingVertical: 8,
    },
    profileModalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 14,
    },
    profileModalOptionText: {
        ...typography.body,
        color: '#1C2434',
        flex: 1,
    },
    profileModalOptionLogout: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        marginTop: 8,
    },
    profileModalOptionTextLogout: {
        ...typography.body,
        color: '#ef4444',
        flex: 1,
    },
    profileModalCloseButton: {
        marginHorizontal: 24,
        marginTop: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    profileModalCloseText: {
        ...typography.body,
        color: '#64748b',
        fontWeight: '600',
    },
});
