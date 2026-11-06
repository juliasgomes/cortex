/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { HomeView } from './components/home/HomeView';
import { CalendarView } from './components/calendar/CalendarView';
import { PatientDirectory } from './components/patients/PatientDirectory';
import { PatientRecordView } from './components/patients/PatientRecordView';
import { FinanceModule } from './components/finance/FinanceModule';
import { ClinicSettingsView } from './components/settings/ClinicSettingsView';
import { JungAssistant } from './components/jung/JungAssistant';
import { NewSessionModal } from './components/modals/NewSessionModal';
import { RescheduleModal } from './components/modals/RescheduleModal';
import { PatientFormModal } from './components/modals/PatientFormModal';
import { CompactPageHelpTooltip } from './components/common/CompactPageHelpTooltip';
import { GoogleAccountModal } from './components/modals/GoogleAccountModal';
import { TasksPage } from './components/tasks/TasksPage';
import { DocumentsView } from './components/documents/DocumentsView';
import { PublicPreCadastroView } from './components/patients/PublicPreCadastroView';
import { Footer } from './components/layout/Footer';
import { MobileSplashScreen } from './components/mobile/MobileSplashScreen';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { InteractiveHelpTour } from './components/common/InteractiveHelpTour';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthScreen } from './components/auth/AuthScreen';
import { MobileLockScreen } from './components/auth/MobileLockScreen';
import { Patient } from './types/clinic';

const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    isLockScreenActive,
    setIsLockScreenActive,
    activeTab,
    selectedPatient,
    setSelectedPatientId,
    openPatientRecord,
    theme,
  } = useClinic();

  // Check if opening public self-service pre-cadastro
  const [isPreCadastroMode] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.location.search.includes('precadastro=true');
  });

  if (isPreCadastroMode) {
    return <PublicPreCadastroView />;
  }

  // App splash screen state (runs on first mount for mobile/desktop)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return sessionStorage.getItem('cortex_splash_seen') !== 'true';
  });

  const handleDismissSplash = () => {
    sessionStorage.setItem('cortex_splash_seen', 'true');
    setShowSplash(false);
  };

  // Modals state
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [sessionInitialDate, setSessionInitialDate] = useState<string | undefined>();
  const [sessionInitialTime, setSessionInitialTime] = useState<string | undefined>();
  const [rescheduleSessionId, setRescheduleSessionId] = useState<string | null>(null);

  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleOpenNewSession = (date?: string, time?: string) => {
    setSessionInitialDate(date);
    setSessionInitialTime(time);
    setIsNewSessionOpen(true);
  };

  const handleOpenReschedule = (sessionId: string) => {
    setRescheduleSessionId(sessionId);
  };

  const handleOpenNewPatient = () => {
    setPatientToEdit(null);
    setIsPatientModalOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setPatientToEdit(patient);
    setIsPatientModalOpen(true);
  };

  // 1. Unauthenticated state -> Show universal login & register screen
  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex flex-col font-sans selection:bg-[#452267]/30 selection:text-white transition-colors duration-300 ${
          theme === 'dark' ? 'dark bg-[#452267] text-[#ede8f8]' : 'bg-[#F8F5F1] text-slate-800'
        }`}
      >
        <ToastContainer />
        <AuthScreen />
      </div>
    );
  }

  // 2. Mobile / Session Lock Screen barrier (WebAuthn biometric / PIN)
  if (isLockScreenActive) {
    return (
      <div
        className={`min-h-screen flex flex-col font-sans selection:bg-[#452267]/30 selection:text-white transition-colors duration-300 ${
          theme === 'dark' ? 'dark bg-[#452267] text-[#ede8f8]' : 'bg-[#F8F5F1] text-slate-800'
        }`}
      >
        <ToastContainer />
        <MobileLockScreen onUnlocked={() => setIsLockScreenActive(false)} />
      </div>
    );
  }

  // 3. Authenticated & Unlocked Application Viewport
  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-[#452267]/30 selection:text-white overflow-x-hidden transition-colors duration-300 pb-20 md:pb-0 ${
        theme === 'dark'
          ? 'dark bg-[#452267] text-[#ede8f8]'
          : 'bg-[#F8F5F1] text-slate-800'
      }`}
    >
      {/* 0. Mobile & Initial Splash Screen (2.5s) */}
      {showSplash && <MobileSplashScreen onFinish={handleDismissSplash} />}

      {/* Toast Feedback notifications */}
      <ToastContainer />

      {/* Top Bar Navigation with Cortex Brand & Logo */}
      <Navbar
        onOpenNewSession={() => handleOpenNewSession()}
        onOpenGoogleModal={() => setIsGoogleModalOpen(true)}
      />

      {/* Desktop Layout Container: Docked Left Sidebar (left: 0) & Fluid Full-Width Main Area */}
      <div className="flex-1 w-full flex">
        {/* Left Sidebar for Desktop - Solid purple #452267 column connecting header and footer without cuts */}
        <div className="hidden md:block w-64 lg:w-72 shrink-0 bg-[#452267] min-h-[calc(100vh-4rem)] p-4">
          <Sidebar />
        </div>

        {/* Main Viewport Container - Cream #F8F5F1 in light mode, #452267 in dark mode */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 bg-[#F8F5F1] dark:bg-[#452267] transition-colors">
          {/* 1. INÍCIO / HOME */}
          {activeTab === 'home' && (
            <div className="animate-fade-slide-up">
              <HomeView
                onOpenNewSession={() => handleOpenNewSession()}
                onOpenReschedule={handleOpenReschedule}
              />
            </div>
          )}

          {/* 2. AGENDA CLÍNICA */}
          {activeTab === 'calendar' && (
            <div className="animate-fade-slide-up">
              <CalendarView
                onOpenNewSessionWithTime={handleOpenNewSession}
                onOpenReschedule={handleOpenReschedule}
              />
            </div>
          )}

          {/* 3. PRONTUÁRIOS & CADERNOS */}
          {activeTab === 'patients' && (
            <div className="animate-fade-slide-up">
              {selectedPatient ? (
                <PatientRecordView
                  patient={selectedPatient}
                  onBack={() => setSelectedPatientId(null)}
                  onEditPatientModal={handleEditPatient}
                />
              ) : (
                <PatientDirectory
                  onOpenNewPatientModal={handleOpenNewPatient}
                  onSelectPatient={(patientId) => openPatientRecord(patientId)}
                />
              )}
            </div>
          )}

          {/* 4. MINHAS TAREFAS */}
          {activeTab === 'tasks' && (
            <div className="animate-fade-slide-up">
              <TasksPage />
            </div>
          )}

          {/* 5. DOCUMENTOS & MODELOS OFICIAIS */}
          {activeTab === 'documents' && (
            <div className="animate-fade-slide-up">
              <DocumentsView />
            </div>
          )}

          {/* 6. MOTOR FINANCEIRO */}
          {activeTab === 'finance' && (
            <div className="animate-fade-slide-up">
              <FinanceModule />
            </div>
          )}

          {/* 7. CONSULTÓRIO & AJUSTES */}
          {activeTab === 'settings' && (
            <div className="animate-fade-slide-up">
              <ClinicSettingsView />
            </div>
          )}
        </main>
      </div>

      {/* Spacious Desktop Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Intelligent AI Assistant Jung - Single Floating Trigger in bottom right */}
      <JungAssistant />

      {/* Interactive Step-by-Step Onboarding Tour */}
      <InteractiveHelpTour />

      {/* Global Modals */}
      <NewSessionModal
        isOpen={isNewSessionOpen}
        onClose={() => setIsNewSessionOpen(false)}
        initialDate={sessionInitialDate}
        initialTime={sessionInitialTime}
      />

      <RescheduleModal
        sessionId={rescheduleSessionId}
        onClose={() => setRescheduleSessionId(null)}
      />

      <PatientFormModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        patientToEdit={patientToEdit}
      />

      <GoogleAccountModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />

      {/* Compact Page Help Tooltip (?) */}
      <CompactPageHelpTooltip />
    </div>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <AppContent />
    </ClinicProvider>
  );
}
