import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { typography } from "../styles/typography";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";
import { getServiceName } from "../utils/serviceTypes";
import { getStageName, getStageColors } from "../utils/caseStages";

interface UploadDocumentScreenProps {
  onBack: () => void;
}

interface DocumentType {
  id: string;
  label: string;
  icon: string;
  required: boolean;
  description: string;
}

interface UploadedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'DNI_FRENTE',
    label: 'DNI Frente',
    icon: 'card-outline',
    required: true,
    description: 'Foto clara del frente de tu DNI',
  },
  {
    id: 'DNI_DORSO',
    label: 'DNI Dorso',
    icon: 'card-outline',
    required: true,
    description: 'Foto clara del dorso de tu DNI',
  },
  {
    id: 'CARTA_PODER',
    label: 'Carta Poder',
    icon: 'document-text-outline',
    required: true,
    description: 'Documento de autorización firmado',
  },
  {
    id: 'DECLARACION_JURADA',
    label: 'Declaración Jurada',
    icon: 'clipboard-outline',
    required: true,
    description: 'Declaración jurada completada y firmada',
  },
  {
    id: 'COMPROBANTE_DOMICILIO',
    label: 'Comprobante de Domicilio',
    icon: 'home-outline',
    required: true,
    description: 'Factura de servicio o certificado de domicilio',
  },
];

const UploadDocumentScreen: React.FC<UploadDocumentScreenProps> = ({ onBack }) => {
  const { userInfo } = useAuth();
  const [step, setStep] = useState<'selectCase' | 'uploadDocs'>('selectCase');
  const [cases, setCases] = useState<any[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile | null>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoadingCases(true);
    try {
      const res = await ApiService.getCases(userInfo?.id, 1, 50);
      if (res.success && res.data?.data) {
        setCases(res.data.data);
      } else if (res.success && Array.isArray(res.data)) {
        setCases(res.data);
      } else {
        setCases([]);
      }
    } catch (e) {
      setCases([]);
    } finally {
      setLoadingCases(false);
    }
  };

  const handleSelectCase = (caseItem: any) => {
    setSelectedCase(caseItem);
    setStep('uploadDocs');
  };

  const handleBackToCase = () => {
    setStep('selectCase');
    setSelectedCase(null);
    setUploadedFiles({});
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a tu galería para subir documentos'
        );
        return false;
      }
    }
    return true;
  };

  const handlePickDocument = async (docType: DocumentType) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Seleccionar documento',
      '¿Cómo deseas agregar el documento?',
      [
        {
          text: 'Cámara',
          onPress: () => pickFromCamera(docType),
        },
        {
          text: 'Galería',
          onPress: () => pickFromGallery(docType),
        },
        {
          text: 'Archivo',
          onPress: () => pickFile(docType),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const pickFromCamera = async (docType: DocumentType) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Se necesita permiso de cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setUploadedFiles(prev => ({
          ...prev,
          [docType.id]: {
            uri: asset.uri,
            name: `${docType.id}_${Date.now()}.jpg`,
            type: 'image/jpeg',
          },
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const pickFromGallery = async (docType: DocumentType) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop() || `${docType.id}_${Date.now()}.jpg`;
        setUploadedFiles(prev => ({
          ...prev,
          [docType.id]: {
            uri: asset.uri,
            name: fileName,
            type: 'image/jpeg',
          },
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const pickFile = async (docType: DocumentType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setUploadedFiles(prev => ({
          ...prev,
          [docType.id]: {
            uri: asset.uri,
            name: asset.name,
            type: asset.mimeType || 'application/octet-stream',
            size: asset.size,
          },
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const handleRemoveFile = (docTypeId: string) => {
    setUploadedFiles(prev => ({
      ...prev,
      [docTypeId]: null,
    }));
  };

  const getUploadedCount = () => {
    return Object.values(uploadedFiles).filter(f => f !== null).length;
  };

  const handleUploadAll = async () => {
    const filesToUpload = Object.entries(uploadedFiles).filter(([_, file]) => file !== null);
    
    if (filesToUpload.length === 0) {
      Alert.alert('Sin documentos', 'Por favor selecciona al menos un documento para subir');
      return;
    }

    setUploading(true);

    try {
      for (const [docType, file] of filesToUpload) {
        if (!file) continue;
        
        setUploadingType(docType);
        
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
        formData.append('caseId', selectedCase.id.toString());
        formData.append('category', docType);
        formData.append('description', DOCUMENT_TYPES.find(d => d.id === docType)?.label || docType);

        const result = await ApiService.uploadFile('/api/v1/customer/documents/upload', formData);
        
        if (!result.success) {
          throw new Error(result.error || 'Error al subir documento');
        }
      }

      Alert.alert(
        '¡Documentos subidos!',
        'Todos los documentos se han subido correctamente',
        [{ text: 'Aceptar', onPress: onBack }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudieron subir los documentos');
    } finally {
      setUploading(false);
      setUploadingType(null);
    }
  };

  // Render case selection
  const renderCaseSelection = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Subir Documentos</Text>
          <Text style={styles.headerSubtitle}>Selecciona el caso</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#09A4B5" />
          <Text style={styles.infoText}>
            Selecciona el caso al cual deseas adjuntar la documentación requerida
          </Text>
        </View>

        {loadingCases ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#09A4B5" />
            <Text style={styles.loadingText}>Cargando casos...</Text>
          </View>
        ) : cases.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No tienes casos activos</Text>
          </View>
        ) : (
          cases.map((caseItem) => {
            const stageColors = getStageColors(caseItem.stageId);
            return (
              <TouchableOpacity
                key={caseItem.id}
                style={styles.caseCard}
                onPress={() => handleSelectCase(caseItem)}
                activeOpacity={0.7}
              >
                <View style={[styles.caseIconContainer, { backgroundColor: stageColors.background }]}>
                  <Ionicons name="briefcase" size={24} color={stageColors.text} />
                </View>
                <View style={styles.caseInfo}>
                  <Text style={styles.caseTitle} numberOfLines={2}>{caseItem.title}</Text>
                  <Text style={styles.caseService}>{getServiceName(caseItem.servicesId)}</Text>
                  <View style={[styles.stageBadge, { backgroundColor: stageColors.background }]}>
                    <Text style={[styles.stageText, { color: stageColors.text }]}>
                      {getStageName(caseItem.stageId)}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </>
  );

  // Render document upload
  const renderDocumentUpload = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToCase} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Documentación</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{selectedCase?.title}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progreso</Text>
            <Text style={styles.progressCount}>
              {getUploadedCount()} de {DOCUMENT_TYPES.length}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(getUploadedCount() / DOCUMENT_TYPES.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {DOCUMENT_TYPES.map((docType) => {
          const uploadedFile = uploadedFiles[docType.id];
          const isUploading = uploadingType === docType.id;

          return (
            <View key={docType.id} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View style={[
                  styles.documentIcon,
                  uploadedFile && styles.documentIconUploaded
                ]}>
                  <Ionicons 
                    name={uploadedFile ? 'checkmark' : docType.icon as any} 
                    size={20} 
                    color={uploadedFile ? '#10b981' : '#64748b'} 
                  />
                </View>
                <View style={styles.documentInfo}>
                  <View style={styles.documentTitleRow}>
                    <Text style={styles.documentTitle}>{docType.label}</Text>
                    {docType.required && (
                      <View style={styles.requiredBadge}>
                        <Text style={styles.requiredText}>Requerido</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.documentDescription}>{docType.description}</Text>
                </View>
              </View>

              {uploadedFile ? (
                <View style={styles.uploadedContainer}>
                  {uploadedFile.type.startsWith('image/') ? (
                    <Image source={{ uri: uploadedFile.uri }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.filePreview}>
                      <Ionicons name="document" size={32} color="#09A4B5" />
                      <Text style={styles.fileName} numberOfLines={1}>{uploadedFile.name}</Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveFile(docType.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    <Text style={styles.removeText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={() => handlePickDocument(docType)}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#09A4B5" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={20} color="#09A4B5" />
                      <Text style={styles.uploadButtonText}>Seleccionar archivo</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity 
          style={[
            styles.submitButton,
            getUploadedCount() === 0 && styles.submitButtonDisabled
          ]}
          onPress={handleUploadAll}
          disabled={uploading || getUploadedCount() === 0}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                Subir {getUploadedCount()} documento{getUploadedCount() !== 1 ? 's' : ''}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {step === 'selectCase' ? renderCaseSelection() : renderDocumentUpload()}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h5,
    color: '#ffffff',
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: '#09A4B5',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    ...typography.bodySmall,
    color: '#0d7a87',
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    ...typography.body,
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    ...typography.body,
    color: '#94a3b8',
  },
  caseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  caseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  caseInfo: {
    flex: 1,
    gap: 4,
  },
  caseTitle: {
    ...typography.body,
    color: '#1C2434',
    fontWeight: '600',
  },
  caseService: {
    ...typography.caption,
    color: '#64748b',
  },
  stageBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  stageText: {
    ...typography.captionSmall,
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    ...typography.body,
    color: '#1C2434',
    fontWeight: '600',
  },
  progressCount: {
    ...typography.bodySmall,
    color: '#09A4B5',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#09A4B5',
    borderRadius: 4,
  },
  documentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentIconUploaded: {
    backgroundColor: '#dcfce7',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  documentTitle: {
    ...typography.body,
    color: '#1C2434',
    fontWeight: '600',
  },
  requiredBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    ...typography.captionSmall,
    color: '#ef4444',
    fontWeight: '500',
  },
  documentDescription: {
    ...typography.caption,
    color: '#64748b',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    ...typography.bodySmall,
    color: '#09A4B5',
    fontWeight: '500',
  },
  uploadedContainer: {
    gap: 12,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 16,
    gap: 12,
  },
  fileName: {
    ...typography.bodySmall,
    color: '#1C2434',
    flex: 1,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  removeText: {
    ...typography.bodySmall,
    color: '#ef4444',
    fontWeight: '500',
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#09A4B5',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    ...typography.body,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default UploadDocumentScreen;
