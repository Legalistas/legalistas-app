import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import CasesScreen from './CasesScreen';
import ChatScreen from './ChatScreen';
import CalendarScreen from './CalendarScreen';
import CaseDetailScreen from './CaseDetailScreen';
import ConsultationDetailScreen from './ConsultationDetailScreen';
import AboutScreen from './AboutScreen';
import WebViewScreen from './WebViewScreen';
import UploadDocumentScreen from './UploadDocumentScreen';
import BottomNavigation from '../components/BottomNavigation';

type TabScreen = 'home' | 'cases' | 'chat' | 'calendar' | 'settings' | 'caseDetail' | 'consultationDetail' | 'about' | 'webview' | 'uploadDocument';

const MainApp = () => {
  const [currentScreen, setCurrentScreen] = useState<TabScreen>('home');
  const [previousScreen, setPreviousScreen] = useState<TabScreen>('home');
  const [selectedCaseId, setSelectedCaseId] = useState<string | number | null>(null);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | number | null>(null);
  const [webViewData, setWebViewData] = useState<{ url: string; title: string } | null>(null);
  const [isInActiveChat, setIsInActiveChat] = useState(false);
  const [openNewConsultation, setOpenNewConsultation] = useState(false);

  const handleNavigateToCaseDetail = (caseId: string | number) => {
    setPreviousScreen(currentScreen);
    setSelectedCaseId(caseId);
    setCurrentScreen('caseDetail');
  };

  const handleNavigateToConsultation = (consultationId: string | number) => {
    setSelectedConsultationId(consultationId);
    setCurrentScreen('consultationDetail');
  };

  const handleBackFromDetail = () => {
    setSelectedCaseId(null);
    setCurrentScreen(previousScreen === 'cases' ? 'cases' : 'home');
  };

  const handleBackFromConsultation = () => {
    setSelectedConsultationId(null);
    if (selectedCaseId) {
      setCurrentScreen('caseDetail');
    } else {
      setCurrentScreen(previousScreen === 'cases' ? 'cases' : 'home');
    }
  };

  const handleNavigateToAbout = () => {
    setCurrentScreen('about');
  };

  const handleBackFromAbout = () => {
    setCurrentScreen('settings');
  };

  const handleNavigateToWebView = (url: string, title: string) => {
    setWebViewData({ url, title });
    setCurrentScreen('webview');
  };

  const handleBackFromWebView = () => {
    setWebViewData(null);
    setCurrentScreen('about');
  };

  // Navegación a nueva consulta (abre Chat con modal)
  const handleNewConsultation = () => {
    setOpenNewConsultation(true);
    setCurrentScreen('chat');
  };

  // Navegación a subir documentos
  const handleUploadDocument = () => {
    setCurrentScreen('uploadDocument');
  };

  const handleBackFromUploadDocument = () => {
    setCurrentScreen('home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            onNavigateToDetail={handleNavigateToCaseDetail} 
            onNewConsultation={handleNewConsultation}
            onUploadDocument={handleUploadDocument}
          />
        );
      case 'cases':
        return <CasesScreen onNavigateToDetail={handleNavigateToCaseDetail} />;
      case 'chat':
        return (
          <ChatScreen 
            onChatViewChange={setIsInActiveChat} 
            openNewConsultation={openNewConsultation}
            onNewConsultationHandled={() => setOpenNewConsultation(false)}
          />
        );
      case 'calendar':
        return <CalendarScreen />;
      case 'settings':
        return <SettingsScreen onNavigateToAbout={handleNavigateToAbout} />;
      case 'about':
        return <AboutScreen onBack={handleBackFromAbout} onNavigateToWebView={handleNavigateToWebView} />;
      case 'webview':
        return webViewData ? (
          <WebViewScreen 
            url={webViewData.url}
            title={webViewData.title}
            onBack={handleBackFromWebView}
          />
        ) : (
          <AboutScreen onBack={handleBackFromAbout} onNavigateToWebView={handleNavigateToWebView} />
        );
      case 'uploadDocument':
        return <UploadDocumentScreen onBack={handleBackFromUploadDocument} />;
      case 'caseDetail':
        return selectedCaseId ? (
          <CaseDetailScreen
            caseId={selectedCaseId}
            onBack={handleBackFromDetail}
            onNavigateToConsultation={handleNavigateToConsultation}
          />
        ) : (
          <HomeScreen 
            onNavigateToDetail={handleNavigateToCaseDetail} 
            onNewConsultation={handleNewConsultation}
            onUploadDocument={handleUploadDocument}
          />
        );
      case 'consultationDetail':
        return selectedConsultationId ? (
          <ConsultationDetailScreen
            consultationId={selectedConsultationId}
            onBack={handleBackFromConsultation}
          />
        ) : (
          <HomeScreen 
            onNavigateToDetail={handleNavigateToCaseDetail} 
            onNewConsultation={handleNewConsultation}
            onUploadDocument={handleUploadDocument}
          />
        );
      default:
        return (
          <HomeScreen 
            onNavigateToDetail={handleNavigateToCaseDetail} 
            onNewConsultation={handleNewConsultation}
            onUploadDocument={handleUploadDocument}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      {currentScreen !== 'caseDetail' && 
       currentScreen !== 'consultationDetail' && 
       currentScreen !== 'about' && 
       currentScreen !== 'webview' &&
       currentScreen !== 'uploadDocument' &&
       !isInActiveChat && (
        <BottomNavigation
          activeTab={currentScreen}
          onTabPress={(tab) => setCurrentScreen(tab as TabScreen)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainApp;