import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSuraagStore } from '../store/useSuraagStore';
import {
  User,
  Shield,
  Fingerprint,
  LogOut,
  Mail,
  Phone,
  Building,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Key,
  Download,
  Lock,
  ExternalLink,
  Award,
  Layers,
  Database,
  Cpu,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useSuraagStore();
  const [isBiometricVerifying, setIsBiometricVerifying] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<string | null>(null);

  // Fallback defaults if user is null or sparse
  const agentUser = user || {
    id: 'AGENT-9942-X',
    employeeId: 'AGENT-9942-X',
    name: 'Dr. Neha Patwardhan / SI Santosh Jadhav',
    role: 'CHIEF FORENSIC INVESTIGATOR',
    email: 'neha.patwardhan@crimebranch.pune.gov.in',
    phone: '+91 98220 44100 (Ext. 402)',
    department: 'Crime Branch Unit 4 - Cyber-Physical Forensics',
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleReverifyBiometrics = () => {
    setIsBiometricVerifying(true);
    setBiometricStatus(null);
    setTimeout(() => {
      setIsBiometricVerifying(false);
      setBiometricStatus('Biometrics re-authenticated successfully. SHA-256 Iris match 100%.');
    }, 1200);
  };

  const assignedCases = [
    {
      caseId: 'CASE-2026-088',
      title: 'The Doomed Triangle (Keshan Malhotra Homicide)',
      status: 'CRITICAL',
      priority: 'CRITICAL',
      confidence: 91.0,
      evidenceCount: 20,
      link: '/cases'
    },
    {
      caseId: 'CASE-2026-712B',
      title: 'Orbital Uplink Sabotage - Station Alpha',
      status: 'ACTIVE',
      priority: 'HIGH',
      confidence: 91.8,
      evidenceCount: 12,
      link: '/cases'
    },
    {
      caseId: 'CASE-2026-884A',
      title: 'Project Genesis Sub-Level 3 Infiltration',
      status: 'PENDING_AUDIT',
      priority: 'HIGH',
      confidence: 94.2,
      evidenceCount: 18,
      link: '/cases'
    }
  ];

  const activityLogs = [
    {
      id: 'log-1',
      action: 'Synchronized Lohegaon Cliff Trajectory Vectors with Timeline Engine',
      timestamp: 'Today at 23:14 IST',
      category: 'BALLISTICS_PHYSICS',
      icon: Activity,
    },
    {
      id: 'log-2',
      action: 'Ingested 20 YOLOv9 Physical Evidence Exhibits (EVID-001 to EVID-020)',
      timestamp: 'Today at 22:45 IST',
      category: 'EVIDENCE_VAULT',
      icon: Database,
    },
    {
      id: 'log-3',
      action: 'Executed Bayesian Inference Chain on Diya & Chetany Alibis',
      timestamp: 'Today at 21:30 IST',
      category: 'EXPLAINABLE_AI',
      icon: Cpu,
    },
    {
      id: 'log-4',
      action: 'Verified HDFC RTGS Wire Audit Log Checksum TXN-6000000-0',
      timestamp: 'Today at 19:10 IST',
      category: 'SECURITY_AUDIT',
      icon: Shield,
    }
  ];

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-12">
      {/* Top Banner Hero Section */}
      <GlassCard glow className="p-6 sm:p-8 relative overflow-hidden border-l-4 border-l-primary bg-secondary-container/10">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden md:block">
          <Shield className="w-64 h-64 text-primary" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Agent Avatar Badge */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-surface-container-high border-2 border-primary/60 p-1 flex items-center justify-center shadow-[0_0_25px_rgba(255,84,76,0.35)]">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              </div>
              {/* Online Pulse Status Pill */}
              <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 text-[10px] font-tactical-data font-bold flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>ONLINE</span>
              </div>
            </div>

            {/* Agent Metadata */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="critical" pulse>LEVEL 5 TOP SECRET</Badge>
                <Badge variant="confidence">{agentUser.role || 'CHIEF FORENSIC INVESTIGATOR'}</Badge>
              </div>

              <h1 className="font-display-lg text-2xl sm:text-3xl font-bold uppercase tracking-tight text-on-surface">
                {agentUser.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-tactical-data text-on-surface-variant/90 pt-1">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-primary" />
                  <span>ID: <strong className="text-on-surface">{agentUser.employeeId}</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-primary" />
                  <span>{agentUser.department || 'Crime Branch Unit 4 - Cyber-Physical Forensics'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleReverifyBiometrics}
              disabled={isBiometricVerifying}
              className="px-4 py-2.5 rounded bg-primary/20 hover:bg-primary text-primary hover:text-on-primary border border-primary/50 font-tactical-data text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(255,84,76,0.25)] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBiometricVerifying ? 'animate-spin' : ''}`} />
              <span>{isBiometricVerifying ? 'VERIFYING...' : 'RE-VERIFY BIOMETRICS'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded bg-surface-container hover:bg-secondary-container text-on-surface hover:text-primary border border-outline-variant transition-all font-tactical-data text-xs uppercase flex items-center gap-2"
            >
              <LogOut className="w-4 h-4 text-primary" />
              <span>TERMINATE SESSION</span>
            </button>
          </div>
        </div>

        {biometricStatus && (
          <div className="mt-4 p-3 rounded bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs font-tactical-data flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{biometricStatus}</span>
          </div>
        )}
      </GlassCard>

      {/* Mission Statistics 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex items-center justify-between border-outline-variant/40">
          <div>
            <span className="text-[10px] font-tactical-data text-on-surface-variant uppercase tracking-widest">
              SOLVED CASES
            </span>
            <div className="font-display-lg text-3xl font-bold text-on-surface mt-1">14</div>
            <span className="text-[10px] font-tactical-data text-emerald-400 font-bold">100% CONVICTION RATE</span>
          </div>
          <div className="p-3 rounded bg-primary/10 border border-primary/30">
            <Award className="w-6 h-6 text-primary" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between border-primary/40">
          <div>
            <span className="text-[10px] font-tactical-data text-on-surface-variant uppercase tracking-widest">
              ACTIVE INVESTIGATIONS
            </span>
            <div className="font-display-lg text-3xl font-bold text-primary mt-1">4</div>
            <span className="text-[10px] font-tactical-data text-primary font-bold">PRIMARY: THE DOOMED TRIANGLE</span>
          </div>
          <div className="p-3 rounded bg-primary/20 border border-primary animate-pulse">
            <Activity className="w-6 h-6 text-primary" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between border-outline-variant/40">
          <div>
            <span className="text-[10px] font-tactical-data text-on-surface-variant uppercase tracking-widest">
              EVIDENCE CATALOGED
            </span>
            <div className="font-display-lg text-3xl font-bold text-on-surface mt-1">128</div>
            <span className="text-[10px] font-tactical-data text-emerald-400 font-bold">YOLOv9 SEGMENTED</span>
          </div>
          <div className="p-3 rounded bg-surface-container border border-outline-variant/40">
            <Database className="w-6 h-6 text-primary" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between border-outline-variant/40">
          <div>
            <span className="text-[10px] font-tactical-data text-on-surface-variant uppercase tracking-widest">
              BAYESIAN ACCURACY
            </span>
            <div className="font-display-lg text-3xl font-bold text-emerald-400 mt-1">99.4%</div>
            <span className="text-[10px] font-tactical-data text-on-surface-variant">MULTI-SENSOR FUSION</span>
          </div>
          <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
        </GlassCard>
      </div>

      {/* Main Grid: Security Clearance & Biometrics (1/3) vs Assigned Cases & Activity Timeline (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Security Clearance, Biometrics & Contact Info */}
        <div className="space-y-6">
          {/* Security Clearance & Biometric Telemetry Card */}
          <GlassCard
            className="p-5 space-y-4"
            header={
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-primary" />
                <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface">
                  Biometric Telemetry & Clearance
                </span>
              </div>
            }
          >
            <div className="p-3.5 rounded bg-surface-container-low border border-outline-variant/40 space-y-2 font-tactical-data text-xs">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">BIOMETRIC STATUS:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  VERIFIED (100%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">IRIS MATCH:</span>
                <span className="text-on-surface font-semibold">SHA-256 ENCRYPTED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">DACTYLOSCOPY:</span>
                <span className="text-on-surface font-semibold">14 MINUTIAE MATCH</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                <span className="text-on-surface-variant">HARDWARE 2FA KEY:</span>
                <span className="text-primary font-bold">YUBIKEY-SEC-9942</span>
              </div>
            </div>

            <div className="p-3.5 rounded bg-surface-container-low border border-outline-variant/40 space-y-2 font-tactical-data text-xs">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">SESSION TOKEN:</span>
                <span className="text-primary font-bold">TOK-2026-9942-AZ</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">LEASE EXPIRATION:</span>
                <span className="text-on-surface font-semibold">07h 45m REMAINING</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">WORKSTATION IP:</span>
                <span className="text-on-surface font-semibold">192.168.4.102 (HQ SEC)</span>
              </div>
            </div>
          </GlassCard>

          {/* Contact Details Card */}
          <GlassCard
            className="p-5 space-y-4"
            header={
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface">
                  Secure Personnel Contact
                </span>
              </div>
            }
          >
            <div className="space-y-3 font-tactical-data text-xs text-on-surface-variant">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase text-on-surface-variant/70 block">PGP ENCRYPTED EMAIL</span>
                  <span className="text-on-surface font-semibold break-all">{agentUser.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-outline-variant/20">
                <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase text-on-surface-variant/70 block">SECURE TELECOM / EXT</span>
                  <span className="text-on-surface font-semibold">{agentUser.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-outline-variant/20">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase text-on-surface-variant/70 block">COMMAND DIVISION HQ</span>
                  <span className="text-on-surface font-semibold">Crime Branch Unit 4, Viman Nagar, Pune</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Assigned Cases & Activity Log */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Cases Section */}
          <GlassCard
            className="p-5 space-y-4"
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface">
                    Assigned Investigation Cases ({assignedCases.length})
                  </span>
                </div>
                <Link to="/cases" className="text-xs font-tactical-data text-primary hover:underline font-bold">
                  View Vault →
                </Link>
              </div>
            }
          >
            <div className="space-y-3">
              {assignedCases.map((c) => (
                <div
                  key={c.caseId}
                  className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/40 hover:border-primary/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-tactical-data text-xs text-primary font-bold">{c.caseId}</span>
                      <Badge variant={c.status.toLowerCase() as any}>{c.status}</Badge>
                      <Badge variant={c.priority.toLowerCase() as any}>{c.priority}</Badge>
                    </div>
                    <h4 className="font-display-lg text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                      {c.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs font-tactical-data text-on-surface-variant/80 pt-1">
                      <span>AI CONFIDENCE: <strong className="text-emerald-400">{c.confidence}%</strong></span>
                      <span>EXHIBITS: <strong className="text-on-surface">{c.evidenceCount} ITEMS</strong></span>
                    </div>
                  </div>

                  <Link
                    to={c.link}
                    className="px-3.5 py-1.5 rounded bg-surface-container hover:bg-primary hover:text-on-primary border border-outline-variant/40 text-xs font-tactical-data uppercase transition-all flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-center"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Activity Timeline Section */}
          <GlassCard
            className="p-5 space-y-4"
            header={
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface">
                  Recent Personnel Activity & Audit Log
                </span>
              </div>
            }
          >
            <div className="space-y-3">
              {activityLogs.map((log) => {
                const IconComponent = log.icon;
                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-start gap-3.5"
                  >
                    <div className="p-2 rounded bg-primary/10 border border-primary/30 shrink-0 mt-0.5">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-tactical-data text-xs text-on-surface font-semibold">
                          {log.action}
                        </span>
                        <span className="text-[10px] font-tactical-data text-on-surface-variant/70 shrink-0">
                          {log.timestamp}
                        </span>
                      </div>
                      <Badge variant="neutral" className="text-[9px] py-0">
                        {log.category}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;
