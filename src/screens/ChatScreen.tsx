import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../styles/typography";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";
import { getStageColors, getStageName } from "../utils/caseStages";
import { getServiceName } from "../utils/serviceTypes";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  avatar?: string;
  supportName: string;
}

// Datos de ejemplo
const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Consulta sobre caso laboral',
    lastMessage: 'Hola, ¿en qué podemos ayudarte?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 2,
    supportName: 'Soporte Legal',
  },
  {
    id: '2',
    title: 'Documentación pendiente',
    lastMessage: 'Los documentos fueron recibidos correctamente.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 0,
    supportName: 'María García',
  },
  {
    id: '3',
    title: 'Consulta general',
    lastMessage: 'Gracias por contactarnos.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 0,
    supportName: 'Juan Pérez',
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    text: '¡Hola! Bienvenido al chat de soporte de Legalistas. ¿En qué podemos ayudarte hoy?',
    sender: 'support',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: true,
  },
  {
    id: '2',
    text: 'Hola, tengo una consulta sobre mi caso laboral',
    sender: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    read: true,
  },
  {
    id: '3',
    text: 'Por supuesto, cuéntanos más detalles sobre tu situación y te ayudaremos.',
    sender: 'support',
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    read: true,
  },
];

interface ChatScreenProps {
  onChatViewChange?: (isInChat: boolean) => void;
  openNewConsultation?: boolean;
  onNewConsultationHandled?: () => void;
}

type ConsultationType = 'legal' | 'sales' | 'support' | null;

const ChatScreen = ({ onChatViewChange, openNewConsultation, onNewConsultationHandled }: ChatScreenProps = {}) => {
  const { userInfo } = useAuth();
  const [activeView, setActiveView] = useState<'list' | 'chat' | 'selectCase'>('list');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Estados para nueva consulta
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ConsultationType>(null);
  const [userCases, setUserCases] = useState<any[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);

  // Efecto para abrir modal de nueva consulta cuando viene de Home
  useEffect(() => {
    if (openNewConsultation) {
      setShowTypeModal(true);
      onNewConsultationHandled?.();
    }
  }, [openNewConsultation]);

  const handleViewChange = (view: 'list' | 'chat' | 'selectCase') => {
    setActiveView(view);
    onChatViewChange?.(view === 'chat' || view === 'selectCase');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
      read: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Scroll al final
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simular respuesta automática
    setTimeout(() => {
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Gracias por tu mensaje. Un asesor te responderá pronto.',
        sender: 'support',
        timestamp: new Date(),
        read: false,
      };
      setMessages(prev => [...prev, autoReply]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const handleOpenConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    handleViewChange('chat');
  };

  const handleBackToList = () => {
    handleViewChange('list');
    setSelectedConversation(null);
    setSelectedType(null);
  };

  // Funciones para nueva consulta
  const handleNewConsultation = () => {
    setShowTypeModal(true);
  };

  const handleSelectType = async (type: ConsultationType) => {
    setSelectedType(type);
    setShowTypeModal(false);

    if (type === 'legal') {
      // Cargar casos del usuario
      setLoadingCases(true);
      handleViewChange('selectCase');
      try {
        const res = await ApiService.getCases(userInfo?.id, 1, 50);
        if (res.success && res.data?.data) {
          setUserCases(res.data.data);
        } else if (res.success && Array.isArray(res.data)) {
          setUserCases(res.data);
        } else {
          setUserCases([]);
        }
      } catch (e) {
        setUserCases([]);
      } finally {
        setLoadingCases(false);
      }
    } else {
      // Ventas o Soporte - iniciar chat directo
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: type === 'sales' ? 'Consulta de Ventas' : 'Soporte Técnico',
        lastMessage: '',
        timestamp: new Date(),
        unreadCount: 0,
        supportName: type === 'sales' ? 'Equipo de Ventas' : 'Soporte Técnico',
      };
      setSelectedConversation(newConversation);
      setMessages([{
        id: '1',
        text: type === 'sales' 
          ? '¡Hola! Soy del equipo de Ventas de Legalistas. ¿En qué podemos ayudarte?' 
          : '¡Hola! Soy del equipo de Soporte Técnico. ¿Cómo podemos asistirte?',
        sender: 'support',
        timestamp: new Date(),
        read: true,
      }]);
      handleViewChange('chat');
    }
  };

  const handleSelectCase = (caseItem: any) => {
    const lawyerName = caseItem.responsibleLawyer?.name || 'Abogado asignado';
    const newConversation: Conversation = {
      id: `case-${caseItem.id}`,
      title: caseItem.title || 'Consulta legal',
      lastMessage: '',
      timestamp: new Date(),
      unreadCount: 0,
      supportName: lawyerName,
      avatar: caseItem.responsibleLawyer?.image 
        ? `https://backend.legalistas.ar${caseItem.responsibleLawyer.image}` 
        : undefined,
    };
    setSelectedConversation(newConversation);
    setMessages([{
      id: '1',
      text: `¡Hola! Soy ${lawyerName}, tu abogado asignado para el caso "${caseItem.title || 'Sin título'}". ¿En qué puedo ayudarte?`,
      sender: 'support',
      timestamp: new Date(),
      read: true,
    }]);
    handleViewChange('chat');
  };

  // Vista de lista de conversaciones
  const renderConversationList = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensajes</Text>
        <Text style={styles.headerSubtitle}>Soporte y consultas</Text>
      </View>

      <ScrollView
        style={styles.main}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Nueva conversación */}
        <TouchableOpacity style={styles.newChatButton} onPress={handleNewConsultation}>
          <View style={styles.newChatIcon}>
            <Ionicons name="add" size={24} color="#fff" />
          </View>
          <View style={styles.newChatText}>
            <Text style={styles.newChatTitle}>Nueva consulta</Text>
            <Text style={styles.newChatSubtitle}>Legales, Ventas o Soporte</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        {/* Lista de conversaciones */}
        <Text style={styles.sectionTitle}>Conversaciones recientes</Text>

        {mockConversations.map((conversation) => (
          <TouchableOpacity
            key={conversation.id}
            style={styles.conversationItem}
            onPress={() => handleOpenConversation(conversation)}
            activeOpacity={0.7}
          >
            <View style={styles.conversationAvatar}>
              <Ionicons name="person" size={20} color="#64748b" />
            </View>
            <View style={styles.conversationContent}>
              <View style={styles.conversationHeader}>
                <Text style={styles.conversationName} numberOfLines={1}>
                  {conversation.supportName}
                </Text>
                <Text style={styles.conversationTime}>
                  {formatTime(conversation.timestamp)}
                </Text>
              </View>
              <Text style={styles.conversationTitle} numberOfLines={1}>
                {conversation.title}
              </Text>
              <Text style={styles.conversationPreview} numberOfLines={1}>
                {conversation.lastMessage}
              </Text>
            </View>
            {conversation.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{conversation.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>
    </>
  );

  // Vista de selección de caso
  const renderSelectCaseView = () => (
    <>
      <View style={styles.chatHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToList}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderTitle}>Seleccionar Caso</Text>
          <Text style={styles.chatHeaderStatus}>Elige el caso para consultar</Text>
        </View>
      </View>

      <ScrollView
        style={styles.main}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        {loadingCases ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#09A4B5" />
            <Text style={styles.loadingText}>Cargando tus casos...</Text>
          </View>
        ) : userCases.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Sin casos</Text>
            <Text style={styles.emptyText}>No tienes casos activos para consultar</Text>
          </View>
        ) : (
          userCases.map((caseItem) => {
            const stageColors = getStageColors(caseItem.stageId);
            const stageName = getStageName(caseItem.stageId);
            const lawyerName = caseItem.responsibleLawyer?.name || 'Sin asignar';
            const lawyerImage = caseItem.responsibleLawyer?.image;

            return (
              <TouchableOpacity
                key={caseItem.id}
                style={styles.caseSelectItem}
                onPress={() => handleSelectCase(caseItem)}
                activeOpacity={0.7}
              >
                <View style={styles.caseSelectLeft}>
                  {lawyerImage ? (
                    <Image
                      source={{ uri: `https://backend.legalistas.ar${lawyerImage}` }}
                      style={styles.caseSelectAvatar}
                    />
                  ) : (
                    <View style={[styles.caseSelectAvatar, styles.avatarPlaceholder]}>
                      <Ionicons name="person" size={20} color="#64748b" />
                    </View>
                  )}
                </View>
                <View style={styles.caseSelectContent}>
                  <View style={[styles.caseBadge, { backgroundColor: stageColors.background, borderColor: stageColors.border }]}>
                    <Text style={[styles.caseBadgeText, { color: stageColors.text }]}>
                      #{caseItem.id} • {stageName}
                    </Text>
                  </View>
                  <Text style={styles.caseSelectTitle} numberOfLines={2}>
                    {caseItem.title || 'Sin título'}
                  </Text>
                  <Text style={styles.caseSelectLawyer}>
                    <Ionicons name="person-outline" size={12} color="#64748b" /> {lawyerName}
                  </Text>
                </View>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#09A4B5" />
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );

  // Modal de tipo de consulta
  const renderTypeModal = () => (
    <Modal
      visible={showTypeModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowTypeModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowTypeModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>¿Qué tipo de consulta?</Text>
          <Text style={styles.modalSubtitle}>Selecciona el área correspondiente</Text>

          <TouchableOpacity
            style={styles.typeOption}
            onPress={() => handleSelectType('legal')}
          >
            <View style={[styles.typeIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="briefcase" size={28} color="#1d4ed8" />
            </View>
            <View style={styles.typeContent}>
              <Text style={styles.typeTitle}>Legales</Text>
              <Text style={styles.typeDescription}>Consulta con tu abogado sobre tu caso</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.typeOption}
            onPress={() => handleSelectType('sales')}
          >
            <View style={[styles.typeIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="cart" size={28} color="#15803d" />
            </View>
            <View style={styles.typeContent}>
              <Text style={styles.typeTitle}>Ventas</Text>
              <Text style={styles.typeDescription}>Información sobre servicios y precios</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.typeOption}
            onPress={() => handleSelectType('support')}
          >
            <View style={[styles.typeIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="help-circle" size={28} color="#c2410c" />
            </View>
            <View style={styles.typeContent}>
              <Text style={styles.typeTitle}>Soporte</Text>
              <Text style={styles.typeDescription}>Ayuda técnica con la aplicación</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setShowTypeModal(false)}
          >
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Vista de chat activo
  const renderChatView = () => (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header del chat */}
      <View style={styles.chatHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToList}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderTitle} numberOfLines={1}>
            {selectedConversation?.supportName || 'Soporte'}
          </Text>
          <Text style={styles.chatHeaderStatus}>En línea</Text>
        </View>
        <TouchableOpacity style={styles.chatHeaderAction}>
          <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Mensajes */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userBubble : styles.supportBubble
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.sender === 'user' ? styles.userMessageText : styles.supportMessageText
              ]}
            >
              {message.text}
            </Text>
            <Text
              style={[
                styles.messageTime,
                message.sender === 'user' ? styles.userMessageTime : styles.supportMessageTime
              ]}
            >
              {formatTime(message.timestamp)}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input de mensaje */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="attach" size={24} color="#64748b" />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#94a3b8"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() ? '#fff' : '#94a3b8'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      {renderTypeModal()}
      {activeView === 'list' && renderConversationList()}
      {activeView === 'selectCase' && renderSelectCaseView()}
      {activeView === 'chat' && renderChatView()}
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
  headerTitle: {
    ...typography.h2,
    color: '#fff',
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: '#94a3b8',
    marginTop: 4,
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mainContent: {
    paddingTop: 16,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  newChatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#09A4B5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  newChatText: {
    flex: 1,
  },
  newChatTitle: {
    ...typography.h6,
    color: '#0f172a',
  },
  newChatSubtitle: {
    ...typography.caption,
    color: '#64748b',
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.labelSmall,
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  conversationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  conversationName: {
    ...typography.labelSmall,
    color: '#0f172a',
    flex: 1,
  },
  conversationTime: {
    ...typography.captionSmall,
    color: '#94a3b8',
    marginLeft: 8,
  },
  conversationTitle: {
    ...typography.bodySmall,
    color: '#334155',
    marginBottom: 2,
  },
  conversationPreview: {
    ...typography.caption,
    color: '#64748b',
  },
  unreadBadge: {
    backgroundColor: '#09A4B5',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unreadBadgeText: {
    ...typography.captionSmall,
    color: '#fff',
    fontWeight: '700',
  },
  // Chat view styles
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    backgroundColor: '#1C2434',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderTitle: {
    ...typography.h6,
    color: '#fff',
  },
  chatHeaderStatus: {
    ...typography.captionSmall,
    color: '#22c55e',
    marginTop: 2,
  },
  chatHeaderAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    backgroundColor: '#09A4B5',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  supportBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    ...typography.body,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  supportMessageText: {
    color: '#0f172a',
  },
  messageTime: {
    ...typography.captionSmall,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  supportMessageTime: {
    color: '#94a3b8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    maxHeight: 100,
    ...typography.body,
    color: '#0f172a',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#09A4B5',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: {
    ...typography.h4,
    color: '#0f172a',
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.bodySmall,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  typeContent: {
    flex: 1,
  },
  typeTitle: {
    ...typography.h6,
    color: '#0f172a',
  },
  typeDescription: {
    ...typography.caption,
    color: '#64748b',
    marginTop: 2,
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  modalCancelText: {
    ...typography.labelSmall,
    color: '#64748b',
  },
  // Case selection styles
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
  },
  caseSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  caseSelectLeft: {
    marginRight: 12,
  },
  caseSelectAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  caseSelectContent: {
    flex: 1,
  },
  caseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    marginBottom: 6,
  },
  caseBadgeText: {
    ...typography.captionSmall,
    fontWeight: '600',
  },
  caseSelectTitle: {
    ...typography.bodySmall,
    color: '#0f172a',
    fontWeight: '600',
    marginBottom: 4,
  },
  caseSelectLawyer: {
    ...typography.caption,
    color: '#64748b',
  },
});

export default ChatScreen;