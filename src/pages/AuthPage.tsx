import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Mail, Lock, User as UserIcon, ArrowRight, Activity, Terminal, AlertTriangle } from 'lucide-react';
import { ScanlineOverlay } from '../components/common/ScanlineOverlay';
import { useSuraagStore } from '../store/useSuraagStore';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const login = useSuraagStore(state => state.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock localStorage database
    const usersStr = localStorage.getItem('suraagMockUsers');
    const users = usersStr ? JSON.parse(usersStr) : [];

    if (isLogin) {
      // Find user
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (!user) {
        const emailExists = users.some((u: any) => u.email === email);
        if (!emailExists) {
          setError('Agent not found. Please register before logging in.');
          setTimeout(() => setIsLogin(false), 1500); // Switch to register automatically after reading error
        } else {
          setError('Invalid passcode.');
        }
        return;
      }
      
      login(
        { id: user.id, employeeId: user.employeeId, role: 'Investigator', name: user.name, email: user.email, department: user.department },
        'mock-token-' + user.id
      );
      navigate('/dashboard');
    } else {
      // Register
      const emailExists = users.some((u: any) => u.email === email);
      if (emailExists) {
        setError('Agent already registered with this email. Please login.');
        setTimeout(() => setIsLogin(true), 1500);
        return;
      }

      const employeeId = 'AGT-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const newUser = {
        id: 'u' + Date.now(),
        employeeId,
        name: name || 'Agent',
        email,
        department,
        password, // In a real app, this would be hashed securely on the backend
      };
      
      users.push(newUser);
      localStorage.setItem('suraagMockUsers', JSON.stringify(users));

      // Trigger backend to log to the text file
      fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          password,
          role: 'Investigator',
          name: name || 'Agent',
          email,
          department
        })
      }).catch(err => console.error('Failed to log to backend file', err));

      login(
        { id: newUser.id, employeeId: newUser.employeeId, role: 'Investigator', name: newUser.name, email: newUser.email, department: newUser.department },
        'mock-token-' + newUser.id
      );
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md flex items-center justify-center relative overflow-hidden selection:bg-primary selection:text-on-primary p-4">
      <ScanlineOverlay laser={true} />
      
      {/* Background Grid */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-30">
        <div className="absolute inset-0 tactical-grid pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel p-8 rounded-lg border border-primary/40 shadow-[0_0_30px_rgba(255,84,76,0.15)] bg-surface-container-lowest/80 backdrop-blur-xl relative overflow-hidden">
          
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/60" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/60" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/60" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/60" />

          {/* Header */}
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-14 h-14 rounded-lg bg-secondary-container flex items-center justify-center border border-primary/60 shadow-[0_0_15px_rgba(255,84,76,0.4)] mb-4">
              <ShieldAlert className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h1 className="font-display-lg text-2xl font-bold uppercase tracking-wider text-on-surface">
              Suraag AI Network
            </h1>
            <p className="text-xs font-tactical-data text-primary mt-2 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3 animate-pulse" />
              Restricted Access
            </p>
          </div>

          {/* Toggle */}
          <div className="flex p-1 bg-surface-container rounded-md mb-6 border border-outline-variant/30">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-tactical-data uppercase tracking-wider rounded transition-all ${
                isLogin ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(255,84,76,0.3)]' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-tactical-data uppercase tracking-wider rounded transition-all ${
                !isLogin ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(255,84,76,0.3)]' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Register
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/50 flex items-center gap-3 text-red-500"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-tactical-data tracking-wide">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-tactical-data text-on-surface-variant uppercase tracking-wider block">Full Name</label>
                    <div className="relative group">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-surface-container-high border border-outline-variant/50 rounded pl-10 pr-4 py-2.5 text-sm font-body-md text-on-surface focus:outline-none focus:border-primary/70 transition-all placeholder:text-on-surface-variant/50"
                        placeholder="Agent Name"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-tactical-data text-on-surface-variant uppercase tracking-wider block">Department / Agency</label>
                    <div className="relative group">
                      <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-surface-container-high border border-outline-variant/50 rounded pl-10 pr-4 py-2.5 text-sm font-body-md text-on-surface focus:outline-none focus:border-primary/70 transition-all placeholder:text-on-surface-variant/50"
                        placeholder="e.g. Forensics Division"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[10px] font-tactical-data text-on-surface-variant uppercase tracking-wider block">Official Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/50 rounded pl-10 pr-4 py-2.5 text-sm font-body-md text-on-surface focus:outline-none focus:border-primary/70 transition-all placeholder:text-on-surface-variant/50"
                  placeholder="agent@suraag.ai"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-tactical-data text-on-surface-variant uppercase tracking-wider block">Passcode</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/50 rounded pl-10 pr-4 py-2.5 text-sm font-body-md text-on-surface focus:outline-none focus:border-primary/70 transition-all placeholder:text-on-surface-variant/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded bg-primary text-on-primary font-tactical-data text-xs font-bold uppercase tracking-wider hover:bg-surface-tint transition-all shadow-[0_0_20px_rgba(255,84,76,0.3)] group"
            >
              <span>{isLogin ? 'Login' : 'Register'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer info */}
          <div className="mt-8 text-center space-y-1">
            <p className="text-[9px] font-tactical-data text-on-surface-variant/60 uppercase tracking-widest">
              UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED
            </p>
            <p className="text-[9px] font-tactical-data text-on-surface-variant/40 uppercase tracking-widest">
              MONITORED BY LATTICE SECURITY PROTOCOL
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
