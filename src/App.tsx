import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { MissionControl } from './pages/MissionControl';
import { CaseManagement } from './pages/CaseManagement';
import { EvidenceVault } from './pages/EvidenceVault';
import { TimelineEngine } from './pages/TimelineEngine';
import { WitnessAnalysis } from './pages/WitnessAnalysis';
import { SuspectIntelligence } from './pages/SuspectIntelligence';
import { EvidenceCorrelationGraph } from './pages/EvidenceCorrelationGraph';
import { AIAssistant } from './pages/AIAssistant';
import { InvestigationReport } from './pages/InvestigationReport';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { AdminDashboard, OfficerDashboard, InvestigatorDashboard, EvidenceDashboard, DigitalDashboard } from './pages/RoleDashboards';
import { useSuraagStore } from './store/useSuraagStore';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<AuthGuard><MainLayout /></AuthGuard>}>
            <Route path="/dashboard" element={<MissionControl />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/officer-dashboard" element={<OfficerDashboard />} />
            <Route path="/investigator-dashboard" element={<InvestigatorDashboard />} />
            <Route path="/evidence-dashboard" element={<EvidenceDashboard />} />
            <Route path="/digital-dashboard" element={<DigitalDashboard />} />
            <Route path="/cases" element={<CaseManagement />} />
            <Route path="/data-ingestion" element={<EvidenceVault />} />
            <Route path="/entity-extraction" element={<WitnessAnalysis />} />
            <Route path="/pattern-detection" element={<TimelineEngine />} />
            <Route path="/influencer-analysis" element={<SuspectIntelligence />} />
            <Route path="/network-map" element={<EvidenceCorrelationGraph />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/report" element={<InvestigationReport />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
