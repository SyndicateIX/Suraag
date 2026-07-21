import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { MissionControl } from './pages/MissionControl';
import { CaseManagement } from './pages/CaseManagement';
import { EvidenceVault } from './pages/EvidenceVault';
import { CrimeScene3D } from './pages/CrimeScene3D';
import { PhysicsEngine } from './pages/PhysicsEngine';
import { TrajectoryLab } from './pages/TrajectoryLab';
import { AttackerEstimation } from './pages/AttackerEstimation';
import { TimelineEngine } from './pages/TimelineEngine';
import { TimelineConfidence } from './pages/TimelineConfidence';
import { WitnessAnalysis } from './pages/WitnessAnalysis';
import { ContradictionMatrix } from './pages/ContradictionMatrix';
import { LineOfSight } from './pages/LineOfSight';
import { MissingEvidence } from './pages/MissingEvidence';
import { ScenarioSimulator } from './pages/ScenarioSimulator';
import { SuspectIntelligence } from './pages/SuspectIntelligence';
import { EvidenceCorrelationGraph } from './pages/EvidenceCorrelationGraph';
import { AIReasoning } from './pages/AIReasoning';
import { AIAssistant } from './pages/AIAssistant';
import { InvestigationReport } from './pages/InvestigationReport';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { AdminDashboard, OfficerDashboard, InvestigatorDashboard, EvidenceDashboard, DigitalDashboard } from './pages/RoleDashboards';
import TargetCursor from './components/TargetCursor/TargetCursor';
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
      <TargetCursor 
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
        targetSelector="a, button, .cursor-target"
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<AuthGuard><MainLayout /></AuthGuard>}>
            <Route path="/dashboard" element={<MissionControl />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/officer-dashboard" element={<OfficerDashboard />} />
            <Route path="/investigator-dashboard" element={<InvestigatorDashboard />} />
            <Route path="/evidence-dashboard" element={<EvidenceDashboard />} />
            <Route path="/digital-dashboard" element={<DigitalDashboard />} />
            <Route path="/cases" element={<CaseManagement />} />
            <Route path="/evidence" element={<EvidenceVault />} />
            <Route path="/reconstruction" element={<CrimeScene3D />} />
            <Route path="/physics" element={<PhysicsEngine />} />
            <Route path="/trajectory" element={<TrajectoryLab />} />
            <Route path="/attacker-estimation" element={<AttackerEstimation />} />
            <Route path="/timeline" element={<TimelineEngine />} />
            <Route path="/timeline-confidence" element={<TimelineConfidence />} />
            <Route path="/witnesses" element={<WitnessAnalysis />} />
            <Route path="/contradiction-matrix" element={<ContradictionMatrix />} />
            <Route path="/line-of-sight" element={<LineOfSight />} />
            <Route path="/missing-evidence" element={<MissingEvidence />} />
            <Route path="/scenarios" element={<ScenarioSimulator />} />
            <Route path="/suspects" element={<SuspectIntelligence />} />
            <Route path="/correlation-graph" element={<EvidenceCorrelationGraph />} />
            <Route path="/ai-reasoning" element={<AIReasoning />} />
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
