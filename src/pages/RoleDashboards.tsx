import React from 'react';
import { useSuraagStore } from '../store/useSuraagStore';

export const AdminDashboard: React.FC = () => {
  const user = useSuraagStore(s => s.user);
  return (
    <div className="w-full max-w-full min-w-0 p-4 sm:p-8 text-center mt-8 sm:mt-20">
      <h1 className="text-2xl sm:text-3xl font-display-lg font-bold text-primary mb-4">Director / Head Command Center</h1>
      <p className="text-on-surface-variant">Welcome, {user?.name}. Full system privileges granted.</p>
    </div>
  );
};

export const OfficerDashboard: React.FC = () => {
  const user = useSuraagStore(s => s.user);
  return (
    <div className="w-full max-w-full min-w-0 p-4 sm:p-8 text-center mt-8 sm:mt-20">
      <h1 className="text-2xl sm:text-3xl font-display-lg font-bold text-primary mb-4">Senior Officer Dashboard</h1>
      <p className="text-on-surface-variant">Welcome, {user?.name}. Manage your team and assigned investigations.</p>
    </div>
  );
};

export const InvestigatorDashboard: React.FC = () => {
  const user = useSuraagStore(s => s.user);
  return (
    <div className="w-full max-w-full min-w-0 p-4 sm:p-8 text-center mt-8 sm:mt-20">
      <h1 className="text-2xl sm:text-3xl font-display-lg font-bold text-primary mb-4">Investigator Dashboard</h1>
      <p className="text-on-surface-variant">Welcome, {user?.name}. View assigned cases and upload evidence.</p>
    </div>
  );
};

export const EvidenceDashboard: React.FC = () => {
  const user = useSuraagStore(s => s.user);
  return (
    <div className="w-full max-w-full min-w-0 p-4 sm:p-8 text-center mt-8 sm:mt-20">
      <h1 className="text-2xl sm:text-3xl font-display-lg font-bold text-primary mb-4">Evidence Dashboard</h1>
      <p className="text-on-surface-variant">Welcome, {user?.name}. Manage the evidence catalog and chain of custody.</p>
    </div>
  );
};

export const DigitalDashboard: React.FC = () => {
  const user = useSuraagStore(s => s.user);
  return (
    <div className="w-full max-w-full min-w-0 p-4 sm:p-8 text-center mt-8 sm:mt-20">
      <h1 className="text-2xl sm:text-3xl font-display-lg font-bold text-primary mb-4">Digital Forensics Dashboard</h1>
      <p className="text-on-surface-variant">Welcome, {user?.name}. Device analysis and AI media extraction.</p>
    </div>
  );
};
