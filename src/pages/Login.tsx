import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Shield, Lock, Fingerprint, Eye, EyeOff, User, Briefcase, ChevronDown, ShieldAlert, Cpu, Database, Search, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSuraagStore } from '../store/useSuraagStore';
import { ScanlineOverlay } from '../components/common/ScanlineOverlay';
import Dither from '../components/Dither/Dither';

const loginSchema = z.object({
  employeeId: z.string().min(5, 'Invalid Employee ID Format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.string().min(1, 'Role selection required'),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const ROLES = [
  { id: 'Director', label: 'Director / Head' },
  { id: 'Senior Officer', label: 'Senior Forensic Officer' },
  { id: 'Investigation Officer', label: 'Investigation Officer' },
  { id: 'Evidence Analyst', label: 'Evidence Analyst' },
  { id: 'Digital Forensics Officer', label: 'Digital Forensics Officer' },
  { id: 'Administrator', label: 'Administrator' },
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useSuraagStore(s => s.login);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [authError, setAuthError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: '' }
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    if (isRegistering && !data.name) {
      setAuthError('Name is required for registration.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError('');
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Authentication Failed');

      login(result.user, result.token);

      setTimeout(() => {
        switch (data.role) {
          case 'Director': navigate('/admin-dashboard'); break;
          case 'Senior Officer': navigate('/officer-dashboard'); break;
          case 'Investigation Officer': navigate('/investigator-dashboard'); break;
          case 'Evidence Analyst': navigate('/evidence-dashboard'); break;
          case 'Digital Forensics Officer': navigate('/digital-dashboard'); break;
          default: navigate('/dashboard'); break;
        }
      }, 1500);
    } catch (err: any) {
      setAuthError(err.message);
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#050505] text-[#F8F8F8] font-body-md overflow-hidden selection:bg-[#C1121F] selection:text-[#F8F8F8]">
      <ScanlineOverlay laser={true} />

      {/* Background Animations */}
      <div className="absolute inset-0 z-0">
        <Dither 
          waveColor={[0.756, 0.070, 0.121]} // #C1121F in RGB
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.5}
          waveFrequency={3}
          waveSpeed={0.25}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/40 to-[#050505] pointer-events-none" />
      </div>

      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse shadow-[0_0_10px_#16A34A]" />
          <span className="font-tactical-data text-xs uppercase tracking-widest text-[#9CA3AF]">
            Secure Connection Established
          </span>
        </div>
        <div className="text-right font-tactical-data text-xs uppercase tracking-widest text-[#9CA3AF]">
          <div>{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div className="text-[#F8F8F8] text-sm mt-1">{currentTime.toLocaleTimeString('en-US', { hour12: false })}</div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 flex flex-col items-center"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#C1121F] blur-2xl opacity-20 rounded-full" />
            <Shield className="w-16 h-16 text-[#F8F8F8] relative z-10" strokeWidth={1.5} />
            <motion.div
              animate={{ y: [0, 64, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-0.5 bg-[#16A34A] shadow-[0_0_8px_#16A34A] z-20 opacity-70"
            />
          </div>
          <h1 className="font-display-lg text-4xl font-bold tracking-[0.2em] uppercase mb-2">
            SURAAG
          </h1>
          <h2 className="text-[#9CA3AF] text-sm font-tactical-data uppercase tracking-widest mb-4">
            AI Crime Scene Intelligence Platform
          </h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C1121F]/10 border border-[#C1121F]/30 rounded-sm">
            <Lock className="w-3 h-3 text-[#C1121F]" />
            <span className="text-[10px] font-bold text-[#C1121F] uppercase tracking-wider">Authorized Personnel Only</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-[#111111]/80 backdrop-blur-xl border border-[#3A3A3A]/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(30,30,30,0.5)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-blue-500/5 blur-[100px] pointer-events-none rounded-full" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10" onKeyUp={handleKeyUp}>

            {authError && (
              <div className="p-3 bg-[#8B0000]/20 border border-[#C1121F] rounded-md flex items-center gap-2 text-[#C1121F] text-xs font-tactical-data uppercase">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {isRegistering && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-tactical-data text-[#9CA3AF] uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <div className="relative group">
                    <input
                      {...register('name')}
                      placeholder="e.g. John Doe"
                      className="w-full bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg px-4 py-3 text-sm text-[#F8F8F8] focus:outline-none focus:border-[#C1121F]/50 focus:bg-[#1E1E1E]/80 transition-all placeholder:text-[#3A3A3A]"
                      disabled={isAuthenticating}
                    />
                    <div className="absolute inset-0 rounded-lg bg-[#C1121F]/10 blur-md opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-tactical-data text-[#9CA3AF] uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-3.5 h-3.5" /> Department / Division
                  </label>
                  <div className="relative group">
                    <input
                      {...register('department')}
                      placeholder="e.g. Cyber Forensics Div."
                      className="w-full bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg px-4 py-3 text-sm text-[#F8F8F8] focus:outline-none focus:border-[#C1121F]/50 focus:bg-[#1E1E1E]/80 transition-all placeholder:text-[#3A3A3A]"
                      disabled={isAuthenticating}
                    />
                    <div className="absolute inset-0 rounded-lg bg-[#C1121F]/10 blur-md opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-tactical-data text-[#9CA3AF] uppercase tracking-wider">Email Address</label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="agent@suraag.gov"
                      className="w-full bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg px-4 py-3 text-sm text-[#F8F8F8] focus:outline-none focus:border-[#C1121F]/50 transition-all placeholder:text-[#3A3A3A]"
                      disabled={isAuthenticating}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-tactical-data text-[#9CA3AF] uppercase tracking-wider">Contact No.</label>
                    <input
                      {...register('phone')}
                      placeholder="+1 234 567 8900"
                      className="w-full bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg px-4 py-3 text-sm text-[#F8F8F8] focus:outline-none focus:border-[#C1121F]/50 transition-all placeholder:text-[#3A3A3A]"
                      disabled={isAuthenticating}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-tactical-data text-[#9CA3AF] uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Employee ID
              </label>
              <div className="relative group">
                <input
                  {...register('employeeId')}
                  placeholder="e.g. DIR-001"
                  className="w-full bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg px-4 py-3 text-sm text-[#F8F8F8] focus:outline-none focus:border-[#C1121F]/50 focus:bg-[#1E1E1E]/80 transition-all placeholder:text-[#3A3A3A]"
                  disabled={isAuthenticating}
                />
                <div className="absolute inset-0 rounded-lg bg-[#C1121F]/10 blur-md opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
              </div>
              {errors.employeeId && <span className="text-[#C1121F] text-[10px] uppercase font-tactical-data">{errors.employeeId.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-tactical-data text-[#9CA3AF] uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> Clearance Level
              </label>
              <div className="relative group">
                <select
                  {...register('role')}
                  className="w-full appearance-none bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg px-4 py-3 text-sm text-[#F8F8F8] focus:outline-none focus:border-[#C1121F]/50 focus:bg-[#1E1E1E]/80 transition-all"
                  disabled={isAuthenticating}
                >
                  <option value="" disabled>Select Role...</option>
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                <div className="absolute inset-0 rounded-lg bg-[#C1121F]/10 blur-md opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
              </div>
              {errors.role && <span className="text-[#C1121F] text-[10px] uppercase font-tactical-data">{errors.role.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-tactical-data text-[#9CA3AF] uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Passphrase
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg pl-4 pr-12 py-3 text-sm text-[#F8F8F8] focus:outline-none focus:border-[#C1121F]/50 focus:bg-[#1E1E1E]/80 transition-all placeholder:text-[#3A3A3A]"
                  disabled={isAuthenticating}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F8F8F8] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <div className="absolute inset-0 rounded-lg bg-[#C1121F]/10 blur-md opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <div className="flex justify-between items-center h-4">
                {errors.password ? (
                  <span className="text-[#C1121F] text-[10px] uppercase font-tactical-data">{errors.password.message}</span>
                ) : <span />}
                {capsLockActive && (
                  <span className="text-[#D97706] text-[10px] uppercase font-tactical-data flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> CAPS LOCK ON
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full relative group overflow-hidden rounded-lg bg-[#F8F8F8] text-[#050505] py-3.5 font-bold font-tactical-data uppercase tracking-widest text-xs transition-all disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-[#C1121F]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isAuthenticating ? (
                    <>
                      <Fingerprint className="w-4 h-4 animate-pulse" />
                      Authenticating...
                    </>
                  ) : (
                    isRegistering ? 'REGISTER NEW AGENT' : 'LOGIN TO SURAAG'
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setAuthError('');
                }}
                disabled={isAuthenticating}
                className="w-full py-3.5 rounded-lg border border-[#3A3A3A] text-[#9CA3AF] hover:bg-[#1E1E1E] hover:text-[#F8F8F8] font-tactical-data text-xs uppercase tracking-widest transition-all"
              >
                {isRegistering ? 'Return to Login' : 'Register New Agent'}
              </button>

              <button
                type="button"
                className="w-full py-3.5 rounded-lg border border-[#C1121F]/30 text-[#C1121F] hover:bg-[#C1121F]/10 font-tactical-data text-xs uppercase tracking-widest transition-all"
              >
                Emergency Access
              </button>
            </div>
          </form>
        </motion.div>

        <div className="mt-8 flex justify-between w-full max-w-sm text-[#9CA3AF] text-[11px] font-tactical-data uppercase tracking-wider">
          <button className="hover:text-[#F8F8F8] transition-colors">Forgot Credentials?</button>
          <button className="hover:text-[#F8F8F8] transition-colors">Contact System Administrator</button>
        </div>
      </div>
    </div>
  );
};
