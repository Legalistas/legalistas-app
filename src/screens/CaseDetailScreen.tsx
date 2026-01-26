import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Dimensions, Linking, Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../styles/typography";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";
import { getStageColors, getStageIconName, getStageName, getProgressFromStage } from "../utils/caseStages";
import { getRelativeTime, formatDate, formatDateLong } from "../utils/formatters";
import { getServiceName } from "../utils/serviceTypes";

const { width } = Dimensions.get('window');

interface CaseDetailProps {
    caseId: string | number;
    onBack: () => void;
    onNavigateToConsultation?: (consultationId: string | number) => void;
}

const CaseDetailScreen: React.FC<CaseDetailProps> = ({ caseId, onBack, onNavigateToConsultation }) => {
    const { userInfo } = useAuth();
    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCaseDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await ApiService.getCaseById(caseId);
                if (res.success && res.data) {
                    setCaseData(res.data);
                } else {
                    setError(res.error || "No se pudo cargar el caso");
                }
            } catch (e: any) {
                setError(e.message || "Error de red");
            } finally {
                setLoading(false);
            }
        };
        fetchCaseDetail();
    }, [caseId]);

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1C2434" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detalle del Caso</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#09A4B5" />
                    <Text style={styles.loadingText}>Cargando caso...</Text>
                </View>
            </View>
        );
    }

    if (error || !caseData) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1C2434" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detalle del Caso</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={48} color="#e11d48" />
                    <Text style={styles.errorText}>{error || "Caso no encontrado"}</Text>
                </View>
            </View>
        );
    }

    const stageColors = getStageColors(caseData.stageId);
    const stageIcon = getStageIconName(caseData.stageId);
    const stageName = getStageName(caseData.stageId);
    const progress = caseData.progress || getProgressFromStage(caseData.stageId);
    const serviceName = getServiceName(caseData.servicesId);

    const expediente = caseData.files && caseData.files[0];
    const openConsultations = caseData.consultation?.filter((c: any) => c.status !== 'CLOSED') || [];
    const closedConsultations = caseData.consultation?.filter((c: any) => c.status === 'CLOSED') || [];
    const documents = caseData.documents || [];

    // Función para obtener el icono según extensión
    const getDocumentIcon = (extension: string): string => {
        const ext = extension?.toLowerCase().replace('.', '');
        switch (ext) {
            case 'pdf':
                return 'document-text';
            case 'doc':
            case 'docx':
                return 'document';
            case 'xls':
            case 'xlsx':
                return 'grid';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return 'image';
            case 'mp4':
            case 'mov':
            case 'avi':
                return 'videocam';
            case 'mp3':
            case 'wav':
                return 'musical-notes';
            case 'zip':
            case 'rar':
                return 'archive';
            case 'json':
                return 'code-slash';
            default:
                return 'document-attach';
        }
    };

    // Función para formatear el tamaño del archivo
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Función para abrir documento
    const handleOpenDocument = async (doc: any) => {
        try {
            const url = `https://backend.legalistas.ar${doc.filePath}`;
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'No se puede abrir este documento');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo abrir el documento');
        }
    };

    // Función para obtener color según categoría
    const getCategoryColor = (category: string): string => {
        switch (category) {
            case 'LIQUIDACION_LRT':
                return '#8b5cf6';
            case 'CONTRATO':
                return '#10b981';
            case 'DEMANDA':
                return '#ef4444';
            case 'SENTENCIA':
                return '#f59e0b';
            case 'PODER':
                return '#3b82f6';
            default:
                return '#64748b';
        }
    };

    // Función para formatear categoría
    const formatCategory = (category: string): string => {
        if (!category) return 'General';
        return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{caseData.title}</Text>
                    <Text style={styles.headerSubtitle}>{serviceName}</Text>
                    <Text style={styles.headerDate}>Creado el {formatDate(caseData.createdAt)}</Text>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Stage Process Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="repeat-outline" size={20} color="#09A4B5" />
                        <Text style={styles.cardTitle}>Etapa del Proceso</Text>
                    </View>

                    {/* Stage Icons Timeline */}
                    <View style={styles.stageTimeline}>
                        {[
                            { id: 1, icon: 'document-text', label: 'Documentación' },
                            { id: 2, icon: 'briefcase', label: 'Caso' },
                            { id: 3, icon: 'checkmark-circle', label: 'Cierre' },
                            { id: 4, icon: 'checkmark-done-circle', label: 'Cobrado' },
                            { id: 5, icon: 'star', label: 'Experiencia' },
                            { id: 6, icon: 'archive', label: 'Cerrado' },
                        ].map((stage, idx) => (
                            <View key={stage.id} style={styles.stageItem}>
                                <View style={[
                                    styles.stageIconContainer,
                                    caseData.stageId >= stage.id && styles.stageIconActive
                                ]}>
                                    <Ionicons
                                        name={stage.icon as any}
                                        size={16}
                                        color={caseData.stageId >= stage.id ? '#09A4B5' : '#cbd5e1'}
                                    />
                                </View>
                                <Text style={[
                                    styles.stageLabel,
                                    caseData.stageId === stage.id && styles.stageLabelActive
                                ]}>
                                    {stage.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <Text style={[styles.currentStage, { color: stageColors.text }]}>{stageName}</Text>
                </View>

                {/* Consultas Section */}
                {(openConsultations.length > 0 || closedConsultations.length > 0) && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="chatbubbles-outline" size={20} color="#09A4B5" />
                            <Text style={styles.cardTitle}>Consultas</Text>
                        </View>
                        <TouchableOpacity style={styles.newConsultButton}>
                            <Ionicons name="add-circle" size={20} color="#fff" />
                            <Text style={styles.newConsultButtonText}>Nueva Consulta</Text>
                        </TouchableOpacity>

                        {openConsultations.map((consult: any) => (
                            <TouchableOpacity 
                                key={consult.id} 
                                style={styles.consultationItem}
                                onPress={() => onNavigateToConsultation?.(consult.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.consultationHeader}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={18} color="#09A4B5" />
                                    <Text style={styles.consultationTitle}>{consult.title}</Text>
                                </View>
                                <Text style={styles.consultationStatus}>
                                    {consult.status === 'CLOSED' ? 'Cerrado' : 'En curso'}
                                </Text>
                                <Text style={styles.consultationDate}>{formatDate(consult.updatedAt)}</Text>
                                {consult.lastMessagePreview && (
                                    <Text style={styles.consultationPreview} numberOfLines={2}>
                                        {consult.lastMessagePreview}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}

                        {closedConsultations.length > 0 && (
                            <>
                                <Text style={styles.sectionSubtitle}>Consultas Cerradas</Text>
                                {closedConsultations.map((consult: any) => (
                                    <TouchableOpacity 
                                        key={consult.id} 
                                        style={[styles.consultationItem, styles.consultationClosed]}
                                        onPress={() => onNavigateToConsultation?.(consult.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.consultationHeader}>
                                            <Ionicons name="checkmark-circle-outline" size={18} color="#64748b" />
                                            <Text style={styles.consultationTitle}>{consult.title}</Text>
                                        </View>
                                        <Text style={styles.consultationStatusClosed}>Cerrado</Text>
                                        <Text style={styles.consultationDate}>{formatDate(consult.updatedAt)}</Text>
                                    </TouchableOpacity>
                                ))}
                            </>
                        )}
                    </View>
                )}

                {/* Expediente Section */}
                {expediente && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="folder-open-outline" size={20} color="#09A4B5" />
                            <Text style={styles.cardTitle}>Expedientes</Text>
                        </View>

                        <View style={styles.expedienteCard}>
                            <Text style={styles.expedienteTitle}>{caseData.title} {expediente.court?.charter}</Text>

                            {expediente.accidentDate && (
                                <View style={styles.expedienteRow}>
                                    <Ionicons name="calendar-outline" size={16} color="#64748b" />
                                    <Text style={styles.expedienteText}>
                                        {formatDateLong(expediente.accidentDate)}
                                    </Text>
                                </View>
                            )}

                            {expediente.cuij && (
                                <View style={styles.expedienteRow}>
                                    <Ionicons name="document-text-outline" size={16} color="#64748b" />
                                    <Text style={styles.expedienteText}>CUIJ: {expediente.cuij}</Text>
                                </View>
                            )}

                            {expediente.court?.courtName && (
                                <View style={styles.expedienteRow}>
                                    <Ionicons name="business-outline" size={16} color="#64748b" />
                                    <Text style={styles.expedienteText}>{expediente.court.courtName}</Text>
                                </View>
                            )}

                            {expediente.accidentDate && (
                                <View style={styles.expedienteRow}>
                                    <Ionicons name="alert-circle-outline" size={16} color="#09A4B5" />
                                    <Text style={[styles.expedienteText, { color: '#09A4B5', fontWeight: '600' }]}>
                                        Fecha accidente: {formatDate(expediente.accidentDate)}
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity style={styles.verDetallesButton}>
                                <Text style={styles.verDetallesText}>Ver Detalles</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Documentos Section */}
                {documents.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="documents-outline" size={20} color="#09A4B5" />
                            <Text style={styles.cardTitle}>Documentos</Text>
                            <View style={styles.documentCountBadge}>
                                <Text style={styles.documentCountText}>{documents.length}</Text>
                            </View>
                        </View>

                        {documents.map((doc: any) => (
                            <TouchableOpacity
                                key={doc.id}
                                style={styles.documentItem}
                                onPress={() => handleOpenDocument(doc)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.documentIconContainer, { backgroundColor: getCategoryColor(doc.category) + '15' }]}>
                                    <Ionicons
                                        name={getDocumentIcon(doc.extension) as any}
                                        size={24}
                                        color={getCategoryColor(doc.category)}
                                    />
                                </View>
                                <View style={styles.documentInfo}>
                                    <Text style={styles.documentName} numberOfLines={2}>
                                        {doc.description || doc.fileName}
                                    </Text>
                                    <View style={styles.documentMeta}>
                                        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(doc.category) + '20' }]}>
                                            <Text style={[styles.categoryText, { color: getCategoryColor(doc.category) }]}>
                                                {formatCategory(doc.category)}
                                            </Text>
                                        </View>
                                        <Text style={styles.documentSize}>{formatFileSize(doc.fileSize)}</Text>
                                    </View>
                                    <View style={styles.documentFooter}>
                                        <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
                                        <Text style={styles.documentDate}>{formatDate(doc.uploadedAt)}</Text>
                                        {doc.uploadedBy && (
                                            <>
                                                <Text style={styles.documentDot}>•</Text>
                                                <Ionicons name="person-outline" size={12} color="#94a3b8" />
                                                <Text style={styles.documentUploader}>{doc.uploadedBy.name}</Text>
                                            </>
                                        )}
                                    </View>
                                </View>
                                <Ionicons name="download-outline" size={20} color="#09A4B5" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Detalles del Caso */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="information-circle-outline" size={20} color="#09A4B5" />
                        <Text style={styles.cardTitle}>Detalles del caso</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>SERVICIO</Text>
                        <Text style={styles.detailValue}>{serviceName}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>ESTADO</Text>
                        <Text style={[styles.detailValue, { color: stageColors.text }]}>{stageName}</Text>
                    </View>

                    {caseData.responsibleLawyer && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>ABOGADO RESPONSABLE</Text>
                            <View style={styles.lawyerRow}>
                                {caseData.responsibleLawyer.image ? (
                                    <Image
                                        source={{ uri: `https://backend.legalistas.ar${caseData.responsibleLawyer.image}` }}
                                        style={styles.smallAvatar}
                                    />
                                ) : (
                                    <View style={styles.smallAvatarPlaceholder}>
                                        <Ionicons name="person" size={16} color="#94a3b8" />
                                    </View>
                                )}
                                <Text style={styles.detailValue}>{caseData.responsibleLawyer.name}</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>FECHA DE INICIO</Text>
                        <Text style={styles.detailValue}>{formatDate(caseData.createdAt)}</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
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
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        ...typography.h4,
        color: '#ffffff',
        marginBottom: 4,
    },
    headerSubtitle: {
        ...typography.bodySmall,
        color: '#09A4B5',
        marginBottom: 4,
    },
    headerDate: {
        ...typography.caption,
        color: '#94a3b8',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        ...typography.h6,
        color: '#64748b',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 16,
    },
    errorText: {
        ...typography.h6,
        color: '#e11d48',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    cardTitle: {
        ...typography.h6,
        color: '#1C2434',
    },
    stageTimeline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
    },
    stageItem: {
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    stageIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    stageIconActive: {
        backgroundColor: '#e6f7f9',
        borderColor: '#09A4B5',
    },
    stageLabel: {
        ...typography.captionSmall,
        color: '#94a3b8',
        textAlign: 'center',
    },
    stageLabelActive: {
        color: '#09A4B5',
        fontWeight: '700',
    },
    currentStage: {
        ...typography.body,
        textAlign: 'center',
        marginTop: 8,
    },
    newConsultButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#09A4B5',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
        marginBottom: 16,
    },
    newConsultButtonText: {
        ...typography.body,
        color: '#ffffff',
    },
    sectionSubtitle: {
        ...typography.bodySmall,
        color: '#64748b',
        marginTop: 20,
        marginBottom: 12,
    },
    consultationItem: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#09A4B5',
    },
    consultationClosed: {
        borderLeftColor: '#cbd5e1',
        opacity: 0.7,
    },
    consultationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    consultationTitle: {
        ...typography.body,
        color: '#1C2434',
        flex: 1,
    },
    consultationStatus: {
        ...typography.caption,
        color: '#09A4B5',
        marginBottom: 4,
    },
    consultationStatusClosed: {
        ...typography.caption,
        color: '#64748b',
        marginBottom: 4,
    },
    consultationDate: {
        ...typography.caption,
        color: '#94a3b8',
        marginBottom: 8,
    },
    consultationPreview: {
        ...typography.caption,
        color: '#64748b',
        lineHeight: 18,
    },
    expedienteCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
    },
    expedienteTitle: {
        ...typography.body,
        color: '#1C2434',
        marginBottom: 12,
    },
    expedienteRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 10,
    },
    expedienteText: {
        ...typography.caption,
        color: '#64748b',
        flex: 1,
        lineHeight: 20,
    },
    verDetallesButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        marginTop: 12,
    },
    verDetallesText: {
        ...typography.bodySmall,
        color: '#09A4B5',
    },
    detailRow: {
        marginBottom: 20,
    },
    detailLabel: {
        ...typography.labelSmall,
        color: '#94a3b8',
        marginBottom: 8,
    },
    detailValue: {
        ...typography.body,
        color: '#1C2434',
    },
    lawyerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    smallAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    smallAvatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Document styles
    documentCountBadge: {
        backgroundColor: '#09A4B5',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 'auto',
    },
    documentCountText: {
        ...typography.captionSmall,
        color: '#ffffff',
        fontWeight: '600',
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        gap: 12,
    },
    documentIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    documentInfo: {
        flex: 1,
        gap: 6,
    },
    documentName: {
        ...typography.body,
        color: '#1C2434',
        fontWeight: '500',
        lineHeight: 20,
    },
    documentMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    categoryText: {
        ...typography.captionSmall,
        fontWeight: '600',
    },
    documentSize: {
        ...typography.caption,
        color: '#64748b',
    },
    documentFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    documentDate: {
        ...typography.captionSmall,
        color: '#94a3b8',
    },
    documentDot: {
        color: '#94a3b8',
        marginHorizontal: 4,
    },
    documentUploader: {
        ...typography.captionSmall,
        color: '#94a3b8',
    },
});

export default CaseDetailScreen;
