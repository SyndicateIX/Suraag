import React from 'react';
import { useSuraagStore } from '../store/useSuraagStore';
import { User, Briefcase, Shield, Fingerprint, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const user = useSuraagStore(s => s.user);
  const logout = useSuraagStore(s => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display-lg font-bold text-primary flex items-center gap-2">
            <User className="w-6 h-6" /> AGENT PROFILE
          </h1>
          <p className="text-on-surface-variant font-tactical-data text-xs uppercase tracking-widest mt-1">
            Secure Personnel Record
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 border border-primary/30 text-primary rounded hover:bg-primary/10 transition-colors font-tactical-data text-xs uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Shield className="w-32 h-32" />
          </div>
          
          <h2 className="text-lg font-display-md text-on-surface font-semibold mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-secondary" /> Identity Card
          </h2>
          
          <div className="space-y-4 font-tactical-data relative z-10">
            <div>
              <label className="text-[10px] text-on-surface-variant uppercase tracking-widest">Full Name</label>
              <div className="text-lg text-on-surface font-semibold">{user.name}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-on-surface-variant uppercase tracking-widest">Employee ID</label>
                <div className="text-sm text-on-surface tracking-wider">{user.employeeId}</div>
              </div>
              <div>
                <label className="text-[10px] text-on-surface-variant uppercase tracking-widest">Clearance Role</label>
                <div className="inline-block px-3 py-1 bg-secondary/10 border border-secondary/30 rounded text-secondary text-[10px] mt-1">
                  {user.role}
                </div>
              </div>
            </div>

            {user.department && (
              <div>
                <label className="text-[10px] text-on-surface-variant uppercase tracking-widest">Department</label>
                <div className="text-sm text-on-surface">{user.department}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {user.email && (
                <div>
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-widest">Email</label>
                  <div className="text-sm text-on-surface">{user.email}</div>
                </div>
              )}
              {user.phone && (
                <div>
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-widest">Contact</label>
                  <div className="text-sm text-on-surface">{user.phone}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 relative overflow-hidden flex flex-col justify-center items-center text-center shadow-sm">
          <Fingerprint className="w-16 h-16 text-primary/40 mb-4" />
          <h3 className="font-display-md text-on-surface mb-2">Biometric Status Verified</h3>
          <p className="text-xs text-on-surface-variant max-w-[250px] font-tactical-data">
            Session actively monitored. Privileges restricted to clearance: <strong className="text-secondary">{user.role}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
