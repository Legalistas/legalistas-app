import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../styles/typography";
import ApiService from "../services/ApiService";
import { formatDateWithTime, getRelativeTime } from "../utils/formatters";

interface ConsultationDetailProps {
    consultationId: string | number;
    onBack: () => void;
}

const ConsultationDetailScreen: React.FC<ConsultationDetailProps> = ({ consultationId, onBack }) => {
    const [consultation, setConsultation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState("");

    useEffect(() => {
        const fetchConsultation = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await ApiService.getConsultationById(consultationId);
                if (res.success && res.data) {
                    setConsultation(res.data);
                } else {
                    setError(res.error || "No se pudo cargar la consulta");
                }
            } catch (e: any) {
                setError(e.message || "Error de red");
            } finally {
                setLoading(false);
            }
        };
        fetchConsultation();
    }, [consultationId]);

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Consulta</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#09A4B5" />
                    <Text style={styles.loadingText}>Cargando consulta...</Text>
                </View>
            </View>
        );
    }

    if (error || !consultation) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Consulta</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={48} color="#e11d48" />
                    <Text style={styles.errorText}>{error || "Consulta no encontrada"}</Text>
                </View>
            </View>
        );
    }

    const isClosed = consultation.status === 'CLOSED';
    const messages = consultation.messages || [];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{consultation.title}</Text>
                    <View style={styles.statusBadge}>
                        <View style={[
                            styles.statusDot,
                            { backgroundColor: isClosed ? '#94a3b8' : '#10b981' }
                        ]} />
                        <Text style={styles.statusText}>
                            {isClosed ? 'Cerrado' : 'En curso'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Messages */}
            <ScrollView
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="chatbubbles-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No hay mensajes en esta consulta</Text>
                    </View>
                ) : (
                    messages.map((message: any, idx: number) => {
                        const isCustomer = message.sender === 'customer';
                        const isResponsible = message.sender === 'responsible';

                        return (
                            <View
                                key={message.id || idx}
                                style={[
                                    styles.messageCard,
                                    isCustomer && styles.messageCustomer,
                                    isResponsible && styles.messageResponsible
                                ]}
                            >
                                <View style={styles.messageHeader}>
                                    <View style={styles.senderInfo}>
                                        <Ionicons
                                            name={isResponsible ? 'briefcase' : 'person'}
                                            size={16}
                                            color={isResponsible ? '#09A4B5' : '#64748b'}
                                        />
                                        <Text style={[
                                            styles.senderName,
                                            isResponsible && styles.senderNameResponsible
                                        ]}>
                                            {isResponsible ? 'Abogado Responsable' : 'Tú'}
                                        </Text>
                                    </View>
                                    <Text style={styles.messageTime}>
                                        {getRelativeTime(message.timestamp)}
                                    </Text>
                                </View>
                                <Text style={styles.messageContent}>{message.content}</Text>
                                <Text style={styles.messageTimestamp}>
                                    {formatDateWithTime(message.timestamp)}
                                </Text>
                            </View>
                        );
                    })
                )}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Input Area - Only if not closed */}
            {!isClosed && (
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Escribe tu mensaje..."
                        placeholderTextColor="#94a3b8"
                        value={messageInput}
                        onChangeText={setMessageInput}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            !messageInput.trim() && styles.sendButtonDisabled
                        ]}
                        disabled={!messageInput.trim()}
                    >
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}

            {isClosed && (
                <View style={styles.closedBanner}>
                    <Ionicons name="lock-closed" size={20} color="#64748b" />
                    <Text style={styles.closedText}>Esta consulta está cerrada</Text>
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
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        ...typography.h4,
        color: '#ffffff',
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
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
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
    },
    messageCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    messageCustomer: {
        backgroundColor: '#f0f9fa',
        borderLeftWidth: 3,
        borderLeftColor: '#09A4B5',
    },
    messageResponsible: {
        backgroundColor: '#ffffff',
        borderLeftWidth: 3,
        borderLeftColor: '#e2e8f0',
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    senderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    senderName: {
        ...typography.caption,
        color: '#64748b',
    },
    senderNameResponsible: {
        color: '#09A4B5',
    },
    messageTime: {
        ...typography.captionSmall,
        color: '#94a3b8',
    },
    messageContent: {
        ...typography.body,
        color: '#1C2434',
        lineHeight: 22,
        marginBottom: 6,
    },
    messageTimestamp: {
        ...typography.captionSmall,
        color: '#94a3b8',
    },
    inputContainer: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    input: {
        ...typography.body,
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 12,
        color: '#1C2434',
        maxHeight: 100,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#09A4B5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#cbd5e1',
    },
    closedBanner: {
        backgroundColor: '#f1f5f9',
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    closedText: {
        ...typography.bodySmall,
        color: '#64748b',
    },
});

export default ConsultationDetailScreen;
