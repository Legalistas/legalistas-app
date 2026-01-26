import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput, Switch, ActivityIndicator, Alert, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { typography } from '../styles/typography';
import ApiService from '../services/ApiService';
import { docsType, genderType } from '../utils/constants';

interface Country {
    id: number;
    name: string;
    prefix: string;
    code: string;
    isActive: boolean;
    states: State[];
}

interface State {
    id: number;
    countryId: number;
    name: string;
    isActive: boolean;
}

interface SettingsScreenProps {
    onNavigateToAbout?: () => void;
    onBack?: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigateToAbout, onBack }) => {
    const [formData, setFormData] = useState({
        name: 'Vilella Jonatan',
        email: 'jonatan@nextweb.com.ar',
        image: '',
        docType: null as number | null,
        docNumber: '',
        phone: '3425266717',
        birthDate: '11/08/1990',
        gender: null as number | null,
        countryId: null as number | null,
        stateId: null as number | null,
        city: '',
        cp: '',
        street: '',
        streetNumber: '',
        description: '',
    });

    const [notifications, setNotifications] = useState({
        push: true,
        email: true,
        caseUpdates: true,
        messages: true,
    });

    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDocumentPicker, setShowDocumentPicker] = useState(false);
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [showStatePicker, setShowStatePicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerDate, setDatePickerDate] = useState(new Date());

    useEffect(() => {
        loadCountries();
    }, []);

    const loadCountries = async () => {
        try {
            setLoading(true);
            const response = await ApiService.getCountries();
            if (response.success && response.data?.data) {
                setCountries(response.data.data);
                // Si hay países y el usuario no tiene uno seleccionado, seleccionar Argentina por defecto
                const argentina = response.data.data.find((c: Country) => c.code === 'AR');
                if (argentina && !formData.countryId) {
                    setFormData(prev => ({ ...prev, countryId: argentina.id }));
                }
            }
        } catch (error) {
            console.error('Error cargando países:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSelectedCountry = () => {
        return countries.find(c => c.id === formData.countryId);
    };

    const getSelectedState = () => {
        const country = getSelectedCountry();
        return country?.states.find(s => s.id === formData.stateId);
    };

    const getAvailableStates = () => {
        const country = getSelectedCountry();
        return country?.states || [];
    };

    const getDocTypeLabel = () => {
        const doc = docsType.find(d => d.value === formData.docType);
        return doc?.label || 'Selecciona tipo';
    };

    const getGenderLabel = () => {
        const gender = genderType.find(g => g.value === formData.gender);
        return gender?.label || 'Selecciona género';
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        
        if (selectedDate) {
            setDatePickerDate(selectedDate);
            // Formatear fecha a DD/MM/AAAA
            const day = selectedDate.getDate().toString().padStart(2, '0');
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const year = selectedDate.getFullYear();
            setFormData({ ...formData, birthDate: `${day}/${month}/${year}` });
        }
    };

    const parseDateString = (dateString: string): Date => {
        if (!dateString) return new Date();
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const year = parseInt(parts[2]);
            return new Date(year, month, day);
        }
        return new Date();
    };

    const handleSaveChanges = async () => {
        try {
            setSaving(true);

            const profileUpdateData = {
                name: formData.name,
                email: formData.email,
                image: formData.image,
                docType: formData.docType,
                docNumber: formData.docNumber,
                gender: formData.gender,
                birthDate: formData.birthDate,
                phone: formData.phone,
                address: {
                    countryId: formData.countryId || 0,
                    stateId: formData.stateId || 0,
                    city: formData.city,
                    cp: formData.cp,
                    street: formData.street,
                    streetNumber: formData.streetNumber,
                    description: formData.description,
                    isDefault: true,
                }
            };

            const response = await ApiService.customRequest(
                '/api/v1/user/profile',
                {
                    method: 'PUT',
                    body: JSON.stringify(profileUpdateData),
                },
                true
            );

            if (response.success) {
                Alert.alert('Éxito', 'Perfil actualizado correctamente');
            } else {
                Alert.alert('Error', response.error || 'No se pudo actualizar el perfil');
            }
        } catch (error) {
            Alert.alert('Error', 'Ocurrió un error al guardar los cambios');
            console.error('Error guardando perfil:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await ApiService.logout();
                            if (response.success) {
                                // Aquí podrías agregar lógica adicional si es necesario
                            } else {
                                Alert.alert('Error', response.error || 'No se pudo cerrar sesión');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Ocurrió un error al cerrar sesión');
                            console.error('Error cerrando sesión:', error);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitleCentered}>Ajustes</Text>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Perfil Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="person-outline" size={24} color="#09A4B5" />
                        <Text style={styles.cardTitle}>Perfil</Text>
                    </View>

                    {/* Avatar */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>VJ</Text>
                        </View>
                        <View style={styles.avatarInfo}>
                            <Text style={styles.avatarName}>{formData.name}</Text>
                            <Text style={styles.avatarEmail}>{formData.email}</Text>
                            <TouchableOpacity style={styles.changePhotoButton}>
                                <Ionicons name="camera-outline" size={16} color="#09A4B5" />
                                <Text style={styles.changePhotoText}>Cambiar foto</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Información Personal Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="document-text-outline" size={24} color="#09A4B5" />
                        <Text style={styles.cardTitle}>Información Personal</Text>
                    </View>

                    {/* Nombre completo */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Nombre completo</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Ingresa tu nombre completo"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Correo electrónico</Text>
                        <View style={[styles.inputContainer, styles.inputDisabled]}>
                            <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: '#94a3b8' }]}
                                value={formData.email}
                                editable={false}
                            />
                            <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" />
                        </View>
                        <Text style={styles.inputHint}>
                            <Ionicons name="information-circle-outline" size={12} color="#64748b" /> El correo electrónico no se puede modificar
                        </Text>
                    </View>

                    {/* Tipo de documento y número en fila */}
                    <View style={styles.inputRow}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>Tipo de documento</Text>
                            <TouchableOpacity
                                style={styles.select}
                                onPress={() => setShowDocumentPicker(!showDocumentPicker)}
                            >
                                <Text style={[styles.selectText, !formData.docType && styles.selectPlaceholder]}>
                                    {getDocTypeLabel()}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#64748b" />
                            </TouchableOpacity>
                            {showDocumentPicker && (
                                <View style={styles.pickerDropdown}>
                                    {docsType.map((type) => (
                                        <TouchableOpacity
                                            key={type.id}
                                            style={styles.pickerOption}
                                            onPress={() => {
                                                setFormData({ ...formData, docType: type.value });
                                                setShowDocumentPicker(false);
                                            }}
                                        >
                                            <Text style={styles.pickerOptionText}>{type.label}</Text>
                                            {formData.docType === type.value && (
                                                <Ionicons name="checkmark" size={20} color="#09A4B5" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={[styles.inputGroup, { flex: 1.5 }]}>
                            <Text style={styles.inputLabel}>Número</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="card-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.docNumber}
                                    onChangeText={(text) => setFormData({ ...formData, docNumber: text })}
                                    placeholder="Número"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Teléfono y Fecha de nacimiento en fila */}
                    <View style={styles.inputRow}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>Teléfono</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="call-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.phone}
                                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                    placeholder="Tu teléfono"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>Fecha de nacimiento</Text>
                            <TouchableOpacity
                                style={styles.inputContainer}
                                onPress={() => {
                                    if (formData.birthDate) {
                                        setDatePickerDate(parseDateString(formData.birthDate));
                                    }
                                    setShowDatePicker(true);
                                }}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                <Text style={[styles.input, !formData.birthDate && { color: '#94a3b8' }]}>
                                    {formData.birthDate || 'DD/MM/AAAA'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* DatePicker Modal para iOS */}
                    {Platform.OS === 'ios' && showDatePicker && (
                        <Modal
                            transparent={true}
                            animationType="fade"
                            visible={showDatePicker}
                            onRequestClose={() => setShowDatePicker(false)}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.datePickerModalContainer}>
                                    <View style={styles.datePickerHeader}>
                                        <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ minWidth: 80 }}>
                                            <Text style={styles.datePickerCancelText}>Cancelar</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.datePickerTitle}>Fecha de nacimiento</Text>
                                        <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ minWidth: 80, alignItems: 'flex-end' }}>
                                            <Text style={styles.datePickerDoneText}>Listo</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.datePickerContent}>
                                        <DateTimePicker
                                            value={datePickerDate}
                                            mode="date"
                                            display="spinner"
                                            onChange={handleDateChange}
                                            maximumDate={new Date()}
                                            locale="es-ES"
                                            textColor="#1C2434"
                                            style={{ width: '100%' }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    )}

                    {/* DatePicker Android */}
                    {Platform.OS === 'android' && showDatePicker && (
                        <DateTimePicker
                            value={datePickerDate}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                            locale="es-ES"
                        />
                    )}

                    {/* Sexo */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Género</Text>
                        <TouchableOpacity
                            style={styles.select}
                            onPress={() => setShowGenderPicker(!showGenderPicker)}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Ionicons name="male-female-outline" size={20} color="#64748b" />
                                <Text style={[styles.selectText, !formData.gender && styles.selectPlaceholder]}>
                                    {getGenderLabel()}
                                </Text>
                            </View>
                            <Ionicons name="chevron-down" size={20} color="#64748b" />
                        </TouchableOpacity>
                        {showGenderPicker && (
                            <View style={styles.pickerDropdown}>
                                {genderType.map((gender) => (
                                    <TouchableOpacity
                                        key={gender.id}
                                        style={styles.pickerOption}
                                        onPress={() => {
                                            setFormData({ ...formData, gender: gender.value });
                                            setShowGenderPicker(false);
                                        }}
                                    >
                                        <Text style={styles.pickerOptionText}>{gender.label}</Text>
                                        {formData.gender === gender.value && (
                                            <Ionicons name="checkmark" size={20} color="#09A4B5" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>



                </View>

                {/* Domicilio Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="home-outline" size={24} color="#09A4B5" />
                        <Text style={styles.cardTitle}>Domicilio</Text>
                    </View>

                    {/* País */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>País</Text>
                        {loading ? (
                            <View style={[styles.select, { justifyContent: 'center' }]}>
                                <ActivityIndicator size="small" color="#09A4B5" />
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={styles.select}
                                    onPress={() => setShowCountryPicker(!showCountryPicker)}
                                    disabled={countries.length === 0}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Ionicons name="globe-outline" size={20} color="#64748b" />
                                        <Text style={[styles.selectText, !getSelectedCountry() && styles.selectPlaceholder]}>
                                            {getSelectedCountry()?.name || 'Selecciona un país'}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-down" size={20} color="#64748b" />
                                </TouchableOpacity>
                                {showCountryPicker && (
                                    <View style={styles.pickerDropdown}>
                                        <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled>
                                            {countries.map((country) => (
                                                <TouchableOpacity
                                                    key={country.id}
                                                    style={styles.pickerOption}
                                                    onPress={() => {
                                                        setFormData({ ...formData, countryId: country.id, stateId: null });
                                                        setShowCountryPicker(false);
                                                    }}
                                                >
                                                    <Text style={styles.pickerOptionText}>{country.name}</Text>
                                                    {formData.countryId === country.id && (
                                                        <Ionicons name="checkmark" size={20} color="#09A4B5" />
                                                    )}
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </>
                        )}
                    </View>

                    {/* Estado/Provincia */}
                    {formData.countryId && getAvailableStates().length > 0 && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Estado/Provincia</Text>
                            <TouchableOpacity
                                style={styles.select}
                                onPress={() => setShowStatePicker(!showStatePicker)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <Ionicons name="location-outline" size={20} color="#64748b" />
                                    <Text style={[styles.selectText, !getSelectedState() && styles.selectPlaceholder]}>
                                        {getSelectedState()?.name || 'Selecciona un estado'}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-down" size={20} color="#64748b" />
                            </TouchableOpacity>
                            {showStatePicker && (
                                <View style={styles.pickerDropdown}>
                                    <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled>
                                        {getAvailableStates().map((state) => (
                                            <TouchableOpacity
                                                key={state.id}
                                                style={styles.pickerOption}
                                                onPress={() => {
                                                    setFormData({ ...formData, stateId: state.id });
                                                    setShowStatePicker(false);
                                                }}
                                            >
                                                <Text style={styles.pickerOptionText}>{state.name}</Text>
                                                {formData.stateId === state.id && (
                                                    <Ionicons name="checkmark" size={20} color="#09A4B5" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Calle y Número en fila */}
                    <View style={styles.inputRow}>
                        <View style={[styles.inputGroup, { flex: 2 }]}>
                            <Text style={styles.inputLabel}>Calle</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="navigate-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.street}
                                    onChangeText={(text) => setFormData({ ...formData, street: text })}
                                    placeholder="Nombre de la calle"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>Número</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={formData.streetNumber}
                                    onChangeText={(text) => setFormData({ ...formData, streetNumber: text })}
                                    placeholder="Nº"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Ciudad y Código Postal en fila */}
                    <View style={styles.inputRow}>
                        <View style={[styles.inputGroup, { flex: 2 }]}>
                            <Text style={styles.inputLabel}>Ciudad</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="business-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.city}
                                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                                    placeholder="Ciudad"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>C.P.</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={formData.cp}
                                    onChangeText={(text) => setFormData({ ...formData, cp: text })}
                                    placeholder="C.P."
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Descripción/Aclaraciones */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Aclaraciones (opcional)</Text>
                        <View style={[styles.inputContainer, { height: 80, alignItems: 'flex-start' }]}>
                            <Ionicons name="document-text-outline" size={20} color="#64748b" style={[styles.inputIcon, { marginTop: 12 }]} />
                            <TextInput
                                style={[styles.input, { height: 70, textAlignVertical: 'top', paddingTop: 10 }]}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                placeholder="Piso, departamento, referencias..."
                                placeholderTextColor="#94a3b8"
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </View>
                </View>

                {/* Notificaciones Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="notifications-outline" size={24} color="#09A4B5" />
                        <Text style={styles.cardTitle}>Notificaciones</Text>
                    </View>

                    <NotificationItem
                        icon="phone-portrait-outline"
                        title="Notificaciones Push"
                        description="Recibe alertas en tu dispositivo"
                        value={notifications.push}
                        onValueChange={(value) => setNotifications({ ...notifications, push: value })}
                    />
                    <NotificationItem
                        icon="mail-outline"
                        title="Notificaciones por Email"
                        description="Recibe actualizaciones por correo"
                        value={notifications.email}
                        onValueChange={(value) => setNotifications({ ...notifications, email: value })}
                    />
                    <NotificationItem
                        icon="briefcase-outline"
                        title="Actualizaciones de Casos"
                        description="Cambios en el estado de tus casos"
                        value={notifications.caseUpdates}
                        onValueChange={(value) => setNotifications({ ...notifications, caseUpdates: value })}
                    />
                    <NotificationItem
                        icon="chatbubble-outline"
                        title="Mensajes"
                        description="Nuevos mensajes de tu abogado"
                        value={notifications.messages}
                        onValueChange={(value) => setNotifications({ ...notifications, messages: value })}
                        isLast
                    />
                </View>

                {/* Botón Guardar */}
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSaveChanges}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={styles.saveButtonText}>Guardando...</Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Opciones Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="settings-outline" size={24} color="#09A4B5" />
                        <Text style={styles.cardTitle}>Más Opciones</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={onNavigateToAbout}
                    >
                        <View style={styles.optionLeft}>
                            <View style={styles.optionIconContainer}>
                                <Ionicons name="information-circle-outline" size={22} color="#09A4B5" />
                            </View>
                            <View>
                                <Text style={styles.optionTitle}>Acerca de Legalistas</Text>
                                <Text style={styles.optionDescription}>Información de la aplicación</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionItem}>
                        <View style={styles.optionLeft}>
                            <View style={styles.optionIconContainer}>
                                <Ionicons name="help-circle-outline" size={22} color="#09A4B5" />
                            </View>
                            <View>
                                <Text style={styles.optionTitle}>Centro de Ayuda</Text>
                                <Text style={styles.optionDescription}>Preguntas frecuentes</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionItem}>
                        <View style={styles.optionLeft}>
                            <View style={styles.optionIconContainer}>
                                <Ionicons name="document-text-outline" size={22} color="#09A4B5" />
                            </View>
                            <View>
                                <Text style={styles.optionTitle}>Términos y Condiciones</Text>
                                <Text style={styles.optionDescription}>Políticas de uso</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.optionItem, { borderBottomWidth: 0 }]} onPress={handleLogout}>
                        <View style={styles.optionLeft}>
                            <View style={[styles.optionIconContainer, { backgroundColor: '#fee2e2' }]}>
                                <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                            </View>
                            <View>
                                <Text style={[styles.optionTitle, { color: '#ef4444' }]}>Cerrar Sesión</Text>
                                <Text style={styles.optionDescription}>Salir de tu cuenta</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Versión 1.0.0</Text>
                    <Text style={styles.footerSubtext}>© 2026 Legalistas. Todos los derechos reservados.</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

interface NotificationItemProps {
    icon: string;
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    isLast?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    icon,
    title,
    description,
    value,
    onValueChange,
    isLast = false
}) => (
    <View style={[styles.notificationItem, isLast && { borderBottomWidth: 0 }]}>
        <View style={styles.notificationIconContainer}>
            <Ionicons name={icon as any} size={22} color="#09A4B5" />
        </View>
        <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{title}</Text>
            <Text style={styles.notificationDescription}>{description}</Text>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#e2e8f0', true: '#09A4B5' }}
            thumbColor="#ffffff"
        />
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
    headerTitleCentered: {
        ...typography.h4,
        color: '#ffffff',
        textAlign: 'center',
        flex: 1,
    },
    content: {
        flex: 1,
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
        marginBottom: 20,
    },
    cardTitle: {
        ...typography.h5,
        color: '#1C2434',
    },
    avatarSection: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#09A4B5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        ...typography.h2,
        color: '#fff',
    },
    avatarInfo: {
        flex: 1,
    },
    avatarName: {
        ...typography.h5,
        color: '#1C2434',
        marginBottom: 4,
    },
    avatarEmail: {
        ...typography.bodySmall,
        color: '#64748b',
        marginBottom: 10,
    },
    changePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    changePhotoText: {
        ...typography.bodySmall,
        color: '#09A4B5',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputLabel: {
        ...typography.bodySmall,
        color: '#1C2434',
        marginBottom: 8,
    },
    inputContainer: {
        height: 50,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        gap: 10,
    },
    inputIcon: {
        marginRight: 4,
    },
    input: {
        ...typography.body,
        flex: 1,
        color: '#1C2434',
    },
    inputDisabled: {
        backgroundColor: '#f8fafc',
    },
    inputHint: {
        ...typography.caption,
        color: '#64748b',
        marginTop: 6,
    },
    select: {
        height: 50,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
    },
    selectText: {
        ...typography.body,
        color: '#1C2434',
    },
    selectPlaceholder: {
        color: '#94a3b8',
    },
    pickerDropdown: {
        marginTop: 8,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        overflow: 'hidden',
    },
    pickerOption: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerOptionText: {
        ...typography.body,
        color: '#1C2434',
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        gap: 12,
    },
    notificationIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#e6f7f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        ...typography.body,
        color: '#1C2434',
        marginBottom: 3,
    },
    notificationDescription: {
        ...typography.caption,
        color: '#64748b',
    },
    saveButton: {
        backgroundColor: '#09A4B5',
        height: 54,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginTop: 24,
        marginBottom: 8,
        flexDirection: 'row',
        gap: 10,
        shadowColor: '#09A4B5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    saveButtonDisabled: {
        backgroundColor: '#94a3b8',
        shadowOpacity: 0.1,
    },
    saveButtonText: {
        ...typography.buttonSmall,
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    datePickerModalContainer: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
        width: '100%',
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        width: '100%',
    },
    datePickerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1C2434',
    },
    datePickerCancelText: {
        fontSize: 16,
        color: '#64748b',
    },
    datePickerDoneText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#09A4B5',
    },
    datePickerContent: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    optionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#e6f7f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C2434',
        marginBottom: 3,
    },
    optionDescription: {
        fontSize: 13,
        color: '#64748b',
    },
    footer: {
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    footerText: {
        fontSize: 13,
        color: '#94a3b8',
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 12,
        color: '#cbd5e1',
        textAlign: 'center',
    },
});

export default SettingsScreen;