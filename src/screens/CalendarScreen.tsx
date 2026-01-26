import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../styles/typography";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";

interface Appointment {
  id: string | number;
  title: string;
  description?: string;
  date: string;
  time: string;
  endTime?: string;
  type: 'videocall' | 'call' | 'presencial' | 'other';
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  lawyer?: {
    id: number;
    name: string;
    image?: string;
  };
  caseId?: number;
  caseTitle?: string;
  location?: string;
  meetingUrl?: string;
}

// Datos de ejemplo mientras no haya API
const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Revisión de Contrato',
    description: 'Revisión del contrato de alquiler con observaciones',
    date: '2026-01-24',
    time: '10:30',
    endTime: '11:00',
    type: 'videocall',
    status: 'scheduled',
    lawyer: { id: 1, name: 'Dr. Carlos Méndez' },
    caseId: 101,
    caseTitle: 'Contrato de Alquiler',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: '2',
    title: 'Audiencia Laboral',
    description: 'Primera audiencia en juzgado laboral',
    date: '2026-01-28',
    time: '09:00',
    endTime: '10:30',
    type: 'presencial',
    status: 'scheduled',
    lawyer: { id: 2, name: 'Dra. María García' },
    caseId: 102,
    caseTitle: 'Despido Injustificado',
    location: 'Juzgado Laboral N° 5, Av. Corrientes 1234',
  },
  {
    id: '3',
    title: 'Llamada de seguimiento',
    description: 'Actualización del estado del caso',
    date: '2026-01-30',
    time: '15:00',
    endTime: '15:30',
    type: 'call',
    status: 'scheduled',
    lawyer: { id: 1, name: 'Dr. Carlos Méndez' },
    caseId: 101,
    caseTitle: 'Contrato de Alquiler',
  },
  {
    id: '4',
    title: 'Consulta inicial',
    description: 'Primera consulta sobre caso de sucesión',
    date: '2026-01-15',
    time: '11:00',
    endTime: '12:00',
    type: 'videocall',
    status: 'completed',
    lawyer: { id: 3, name: 'Dr. Juan Pérez' },
  },
  {
    id: '5',
    title: 'Reunión cancelada',
    date: '2026-01-20',
    time: '14:00',
    type: 'videocall',
    status: 'cancelled',
    lawyer: { id: 2, name: 'Dra. María García' },
  },
];

const CalendarScreen = () => {
  const { userInfo } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedCancelReason, setSelectedCancelReason] = useState<string | null>(null);

  const cancelReasons = [
    { key: 'schedule', label: 'Tengo otro compromiso' },
    { key: 'health', label: 'Problemas de salud' },
    { key: 'work', label: 'Motivos laborales' },
    { key: 'travel', label: 'Estoy de viaje' },
    { key: 'other', label: 'Otro motivo' },
  ];

  const fetchAppointments = async (isRefresh = false) => {
    if (!userInfo?.id) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await ApiService.getAppointments(userInfo.id);
      
      if (res.success && res.data?.data && Array.isArray(res.data.data)) {
        setAppointments(res.data.data);
      } else if (res.success && Array.isArray(res.data)) {
        setAppointments(res.data);
      } else {
        // Si no hay API, usar datos mock
        setAppointments(mockAppointments);
      }
    } catch (e: any) {
      // Usar datos mock si falla
      setAppointments(mockAppointments);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [userInfo?.id]);

  const handleRefresh = useCallback(() => {
    fetchAppointments(true);
  }, [userInfo?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) {
      return 'Hoy';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Mañana';
    }

    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return {
      day: date.getDate().toString(),
      month: date.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase(),
      weekday: date.toLocaleDateString('es-AR', { weekday: 'short' }),
    };
  };

  const getTypeIcon = (type: Appointment['type']) => {
    switch (type) {
      case 'videocall': return 'videocam';
      case 'call': return 'call';
      case 'presencial': return 'location';
      default: return 'calendar';
    }
  };

  const getTypeLabel = (type: Appointment['type']) => {
    switch (type) {
      case 'videocall': return 'Videollamada';
      case 'call': return 'Llamada';
      case 'presencial': return 'Presencial';
      default: return 'Cita';
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return { bg: '#EFF6FF', text: '#1d4ed8', border: '#bfdbfe' };
      case 'completed': return { bg: '#F0FDF4', text: '#15803d', border: '#bbf7d0' };
      case 'cancelled': return { bg: '#FEF2F2', text: '#dc2626', border: '#fecaca' };
      case 'pending': return { bg: '#FFF7ED', text: '#c2410c', border: '#fed7aa' };
      default: return { bg: '#F1F5F9', text: '#64748b', border: '#e2e8f0' };
    }
  };

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const isUpcoming = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (activeFilter === 'upcoming') {
      return isUpcoming(apt.date) && apt.status !== 'cancelled';
    } else if (activeFilter === 'past') {
      return !isUpcoming(apt.date) || apt.status === 'completed';
    }
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.date + 'T' + a.time);
    const dateB = new Date(b.date + 'T' + b.time);
    return activeFilter === 'past' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  // Agrupar por fecha
  const groupedAppointments = filteredAppointments.reduce((groups, apt) => {
    const date = apt.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(apt);
    return groups;
  }, {} as Record<string, Appointment[]>);

  const handleOpenDetail = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedAppointment(null);
  };

  const handleConfirmAppointment = () => {
    if (selectedAppointment) {
      // Aquí iría la llamada a la API para confirmar
      Alert.alert(
        '¡Cita Confirmada!',
        `Tu cita "${selectedAppointment.title}" ha sido confirmada.`,
        [{ text: 'OK', onPress: handleCloseDetail }]
      );
      // Actualizar estado local
      setAppointments(prev => prev.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, status: 'scheduled' as const }
          : apt
      ));
    }
  };

  const handleCantAttend = () => {
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setCancelReason('');
    setSelectedCancelReason(null);
  };

  const handleSubmitCancel = () => {
    if (!selectedCancelReason && !cancelReason.trim()) {
      Alert.alert('Motivo requerido', 'Por favor selecciona o escribe el motivo por el cual no puedes asistir.');
      return;
    }

    const reason = selectedCancelReason === 'other' ? cancelReason : 
      cancelReasons.find(r => r.key === selectedCancelReason)?.label || cancelReason;

    // Aquí iría la llamada a la API para cancelar
    Alert.alert(
      'Solicitud Enviada',
      'Hemos notificado al equipo legal. Te contactaremos para reprogramar tu cita.',
      [{ 
        text: 'OK', 
        onPress: () => {
          // Actualizar estado local
          if (selectedAppointment) {
            setAppointments(prev => prev.map(apt => 
              apt.id === selectedAppointment.id 
                ? { ...apt, status: 'cancelled' as const }
                : apt
            ));
          }
          handleCloseCancelModal();
          handleCloseDetail();
        }
      }]
    );
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const filters = [
    { key: 'upcoming', label: 'Próximas' },
    { key: 'past', label: 'Pasadas' },
    { key: 'all', label: 'Todas' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mis Citas</Text>
          <Text style={styles.headerSubtitle}>
            {filteredAppointments.length} {filteredAppointments.length === 1 ? 'cita' : 'citas'} {activeFilter === 'upcoming' ? 'programadas' : ''}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.main}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#09A4B5']}
            tintColor="#09A4B5"
          />
        }
      >
        {/* Filtros */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                activeFilter === filter.key && styles.filterChipActive
              ]}
              onPress={() => setActiveFilter(filter.key as typeof activeFilter)}
            >
              <Text style={[
                styles.filterChipText,
                activeFilter === filter.key && styles.filterChipTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Loading */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#09A4B5" />
            <Text style={styles.loadingText}>Cargando citas...</Text>
          </View>
        ) : filteredAppointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Sin citas</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'upcoming' 
                ? 'No tienes citas programadas próximamente' 
                : 'No hay citas para mostrar'}
            </Text>
          </View>
        ) : (
          Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
            <View key={date} style={styles.dayGroup}>
              <Text style={styles.dayTitle}>{formatDate(date)}</Text>
              
              {dayAppointments.map((apt) => {
                const statusColor = getStatusColor(apt.status);
                const dateShort = formatDateShort(apt.date);

                return (
                  <TouchableOpacity
                    key={apt.id}
                    style={[
                      styles.appointmentCard,
                      apt.status === 'cancelled' && styles.appointmentCardCancelled
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleOpenDetail(apt)}
                  >
                    <View style={styles.appointmentLeft}>
                      <View style={[styles.dateBox, apt.status === 'cancelled' && styles.dateBoxCancelled]}>
                        <Text style={[styles.dateMonth, apt.status === 'cancelled' && styles.textCancelled]}>
                          {dateShort.month}
                        </Text>
                        <Text style={[styles.dateDay, apt.status === 'cancelled' && styles.textCancelled]}>
                          {dateShort.day}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.appointmentContent}>
                      <View style={styles.appointmentHeader}>
                        <Text 
                          style={[
                            styles.appointmentTitle, 
                            apt.status === 'cancelled' && styles.textCancelled
                          ]} 
                          numberOfLines={1}
                        >
                          {apt.title}
                        </Text>
                        <View style={[
                          styles.statusBadge, 
                          { backgroundColor: statusColor.bg, borderColor: statusColor.border }
                        ]}>
                          <Text style={[styles.statusText, { color: statusColor.text }]}>
                            {getStatusLabel(apt.status)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.appointmentMeta}>
                        <Ionicons name="time-outline" size={14} color="#64748b" />
                        <Text style={styles.appointmentMetaText}>
                          {apt.time}{apt.endTime ? ` - ${apt.endTime}` : ''}
                        </Text>
                        <Ionicons 
                          name={getTypeIcon(apt.type) as any} 
                          size={14} 
                          color="#64748b" 
                          style={{ marginLeft: 12 }}
                        />
                        <Text style={styles.appointmentMetaText}>{getTypeLabel(apt.type)}</Text>
                      </View>

                      {apt.lawyer && (
                        <View style={styles.lawyerInfo}>
                          <View style={styles.lawyerAvatar}>
                            {apt.lawyer.image ? (
                              <Image 
                                source={{ uri: `https://backend.legalistas.ar${apt.lawyer.image}` }} 
                                style={styles.lawyerAvatarImage} 
                              />
                            ) : (
                              <Ionicons name="person" size={12} color="#64748b" />
                            )}
                          </View>
                          <Text style={styles.lawyerName}>{apt.lawyer.name}</Text>
                        </View>
                      )}

                      {apt.caseTitle && (
                        <View style={styles.caseInfo}>
                          <Ionicons name="briefcase-outline" size={12} color="#94a3b8" />
                          <Text style={styles.caseInfoText} numberOfLines={1}>{apt.caseTitle}</Text>
                        </View>
                      )}
                    </View>

                    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Modal de Detalle de Cita */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseDetail}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            {selectedAppointment && (
              <>
                <View style={styles.detailModalHeader}>
                  <Text style={styles.detailModalTitle}>{selectedAppointment.title}</Text>
                  <TouchableOpacity onPress={handleCloseDetail} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.detailModalBody} showsVerticalScrollIndicator={false}>
                  {/* Estado */}
                  <View style={[
                    styles.detailStatusBadge,
                    { backgroundColor: getStatusColor(selectedAppointment.status).bg }
                  ]}>
                    <Ionicons 
                      name={selectedAppointment.status === 'scheduled' ? 'calendar' : 
                            selectedAppointment.status === 'completed' ? 'checkmark-circle' : 'close-circle'} 
                      size={16} 
                      color={getStatusColor(selectedAppointment.status).text} 
                    />
                    <Text style={[styles.detailStatusText, { color: getStatusColor(selectedAppointment.status).text }]}>
                      {getStatusLabel(selectedAppointment.status)}
                    </Text>
                  </View>

                  {/* Fecha y Hora */}
                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconBox}>
                        <Ionicons name="calendar-outline" size={20} color="#09A4B5" />
                      </View>
                      <View style={styles.detailRowContent}>
                        <Text style={styles.detailLabel}>Fecha</Text>
                        <Text style={styles.detailValue}>{formatFullDate(selectedAppointment.date)}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconBox}>
                        <Ionicons name="time-outline" size={20} color="#09A4B5" />
                      </View>
                      <View style={styles.detailRowContent}>
                        <Text style={styles.detailLabel}>Horario</Text>
                        <Text style={styles.detailValue}>
                          {selectedAppointment.time}{selectedAppointment.endTime ? ` - ${selectedAppointment.endTime}` : ''}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconBox}>
                        <Ionicons name={getTypeIcon(selectedAppointment.type) as any} size={20} color="#09A4B5" />
                      </View>
                      <View style={styles.detailRowContent}>
                        <Text style={styles.detailLabel}>Tipo de cita</Text>
                        <Text style={styles.detailValue}>{getTypeLabel(selectedAppointment.type)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Abogado */}
                  {selectedAppointment.lawyer && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Profesional</Text>
                      <View style={styles.lawyerCard}>
                        <View style={styles.lawyerCardAvatar}>
                          {selectedAppointment.lawyer.image ? (
                            <Image 
                              source={{ uri: `https://backend.legalistas.ar${selectedAppointment.lawyer.image}` }} 
                              style={styles.lawyerCardAvatarImage} 
                            />
                          ) : (
                            <Ionicons name="person" size={24} color="#64748b" />
                          )}
                        </View>
                        <Text style={styles.lawyerCardName}>{selectedAppointment.lawyer.name}</Text>
                      </View>
                    </View>
                  )}

                  {/* Caso asociado */}
                  {selectedAppointment.caseTitle && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Caso asociado</Text>
                      <View style={styles.caseCard}>
                        <Ionicons name="briefcase" size={20} color="#09A4B5" />
                        <Text style={styles.caseCardText}>{selectedAppointment.caseTitle}</Text>
                      </View>
                    </View>
                  )}

                  {/* Ubicación o Link */}
                  {selectedAppointment.location && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Ubicación</Text>
                      <View style={styles.locationCard}>
                        <Ionicons name="location" size={20} color="#dc2626" />
                        <Text style={styles.locationCardText}>{selectedAppointment.location}</Text>
                      </View>
                    </View>
                  )}

                  {selectedAppointment.meetingUrl && (
                    <View style={styles.detailSection}>
                      <TouchableOpacity style={styles.meetingLinkButton}>
                        <Ionicons name="videocam" size={20} color="#fff" />
                        <Text style={styles.meetingLinkText}>Unirse a la videollamada</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Descripción */}
                  {selectedAppointment.description && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Descripción</Text>
                      <Text style={styles.descriptionText}>{selectedAppointment.description}</Text>
                    </View>
                  )}
                </ScrollView>

                {/* Botones de acción - solo para citas programadas */}
                {selectedAppointment.status === 'scheduled' && (
                  <View style={styles.detailActions}>
                    <TouchableOpacity 
                      style={styles.cantAttendButton}
                      onPress={handleCantAttend}
                    >
                      <Ionicons name="close-circle-outline" size={20} color="#dc2626" />
                      <Text style={styles.cantAttendButtonText}>No puedo asistir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.confirmButton}
                      onPress={handleConfirmAppointment}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.confirmButtonText}>Confirmar asistencia</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Cancelación */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseCancelModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleCloseCancelModal}
        >
          <TouchableOpacity activeOpacity={1} style={styles.cancelModalContent}>
            <View style={styles.cancelModalHandle} />
            <Text style={styles.cancelModalTitle}>¿Por qué no puedes asistir?</Text>
            <Text style={styles.cancelModalSubtitle}>
              Selecciona el motivo para que podamos reprogramar tu cita
            </Text>

            {cancelReasons.map((reason) => (
              <TouchableOpacity
                key={reason.key}
                style={[
                  styles.reasonOption,
                  selectedCancelReason === reason.key && styles.reasonOptionSelected
                ]}
                onPress={() => setSelectedCancelReason(reason.key)}
              >
                <View style={[
                  styles.reasonRadio,
                  selectedCancelReason === reason.key && styles.reasonRadioSelected
                ]}>
                  {selectedCancelReason === reason.key && (
                    <View style={styles.reasonRadioInner} />
                  )}
                </View>
                <Text style={[
                  styles.reasonText,
                  selectedCancelReason === reason.key && styles.reasonTextSelected
                ]}>
                  {reason.label}
                </Text>
              </TouchableOpacity>
            ))}

            {selectedCancelReason === 'other' && (
              <TextInput
                style={styles.reasonInput}
                placeholder="Describe el motivo..."
                placeholderTextColor="#94a3b8"
                value={cancelReason}
                onChangeText={setCancelReason}
                multiline
                numberOfLines={3}
              />
            )}

            <View style={styles.cancelModalActions}>
              <TouchableOpacity 
                style={styles.cancelModalCancelBtn}
                onPress={handleCloseCancelModal}
              >
                <Text style={styles.cancelModalCancelText}>Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.cancelModalSubmitBtn,
                  !selectedCancelReason && styles.cancelModalSubmitBtnDisabled
                ]}
                onPress={handleSubmitCancel}
                disabled={!selectedCancelReason}
              >
                <Text style={styles.cancelModalSubmitText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    gap: 4,
  },
  headerTitle: {
    ...typography.h2,
    color: '#fff',
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: '#94a3b8',
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mainContent: {
    paddingTop: 16,
  },
  filtersContainer: {
    marginBottom: 20,
    marginHorizontal: -16,
    maxHeight: 44,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
    height: 36,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#09A4B5',
    borderColor: '#09A4B5',
  },
  filterChipText: {
    ...typography.labelSmall,
    color: '#64748b',
    lineHeight: 16,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    ...typography.body,
    color: '#64748b',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    ...typography.h5,
    color: '#64748b',
    marginTop: 16,
  },
  emptyText: {
    ...typography.bodySmall,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  dayGroup: {
    marginBottom: 24,
  },
  dayTitle: {
    ...typography.labelSmall,
    color: '#64748b',
    textTransform: 'capitalize',
    marginBottom: 12,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appointmentCardCancelled: {
    opacity: 0.7,
    backgroundColor: '#fafafa',
  },
  appointmentLeft: {
    marginRight: 12,
  },
  dateBox: {
    backgroundColor: 'rgba(9, 164, 181, 0.1)',
    width: 52,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBoxCancelled: {
    backgroundColor: '#f1f5f9',
  },
  dateMonth: {
    ...typography.captionSmall,
    color: '#09A4B5',
    fontWeight: '600',
  },
  dateDay: {
    ...typography.h4,
    color: '#09A4B5',
  },
  textCancelled: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  appointmentContent: {
    flex: 1,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  appointmentTitle: {
    ...typography.bodySmall,
    color: '#0f172a',
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    ...typography.captionSmall,
    fontWeight: '600',
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentMetaText: {
    ...typography.caption,
    color: '#64748b',
    marginLeft: 4,
  },
  lawyerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lawyerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    overflow: 'hidden',
  },
  lawyerAvatarImage: {
    width: 20,
    height: 20,
  },
  lawyerName: {
    ...typography.caption,
    color: '#334155',
  },
  caseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  caseInfoText: {
    ...typography.captionSmall,
    color: '#94a3b8',
    flex: 1,
  },
  // Modal de detalle
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  detailModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  detailModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailModalTitle: {
    ...typography.h4,
    color: '#0f172a',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  detailModalBody: {
    padding: 20,
  },
  detailStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
  },
  detailStatusText: {
    ...typography.labelSmall,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    ...typography.labelSmall,
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(9, 164, 181, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailRowContent: {
    flex: 1,
  },
  detailLabel: {
    ...typography.captionSmall,
    color: '#94a3b8',
    marginBottom: 2,
  },
  detailValue: {
    ...typography.body,
    color: '#0f172a',
  },
  lawyerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  lawyerCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  lawyerCardAvatarImage: {
    width: 48,
    height: 48,
  },
  lawyerCardName: {
    ...typography.h6,
    color: '#0f172a',
  },
  caseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 164, 181, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  caseCardText: {
    ...typography.body,
    color: '#0f172a',
    flex: 1,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  locationCardText: {
    ...typography.body,
    color: '#0f172a',
    flex: 1,
  },
  meetingLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d4ed8',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  meetingLinkText: {
    ...typography.labelSmall,
    color: '#fff',
  },
  descriptionText: {
    ...typography.body,
    color: '#64748b',
    lineHeight: 22,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cantAttendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cantAttendButtonText: {
    ...typography.labelSmall,
    color: '#dc2626',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#09A4B5',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
    ...typography.labelSmall,
    color: '#fff',
  },
  // Modal de cancelación
  cancelModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  cancelModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  cancelModalTitle: {
    ...typography.h4,
    color: '#0f172a',
    textAlign: 'center',
  },
  cancelModalSubtitle: {
    ...typography.bodySmall,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reasonOptionSelected: {
    backgroundColor: 'rgba(9, 164, 181, 0.1)',
    borderColor: '#09A4B5',
  },
  reasonRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reasonRadioSelected: {
    borderColor: '#09A4B5',
  },
  reasonRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#09A4B5',
  },
  reasonText: {
    ...typography.body,
    color: '#334155',
  },
  reasonTextSelected: {
    color: '#09A4B5',
    fontWeight: '600',
  },
  reasonInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...typography.body,
    color: '#0f172a',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  cancelModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelModalCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  cancelModalCancelText: {
    ...typography.labelSmall,
    color: '#64748b',
  },
  cancelModalSubmitBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#dc2626',
  },
  cancelModalSubmitBtnDisabled: {
    backgroundColor: '#fca5a5',
  },
  cancelModalSubmitText: {
    ...typography.labelSmall,
    color: '#fff',
  },
});

export default CalendarScreen;