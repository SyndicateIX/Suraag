import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderPlus,
  Filter,
  Search,
  CheckCircle,
  Database,
  User,
  MapPin,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '../services/apiClient';
import { Case } from '../types';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

const caseSchema = z.object({
  caseNumber: z.string().min(3, 'Case number is required (e.g. CASE-2026-999Z)'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  status: z.enum(['ACTIVE', 'CRITICAL', 'ARCHIVED', 'PENDING_AUDIT']),
  priority: z.enum(['CRITICAL', 'HIGH', 'ROUTINE']),
  assignedTo: z.string().min(3, 'Investigator name required'),
  location: z.string().min(3, 'Location required'),
  incidentDate: z.string().min(1, 'Date is required'),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  confidenceScore: z.number().min(0).max(100).default(90.0),
});

type CaseFormValues = z.infer<typeof caseSchema>;

export const CaseManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { selectedCaseId, setSelectedCaseId } = useSuraagStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'priority'>('date');

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['cases', { statusFilter, priorityFilter, searchQuery }],
    queryFn: () => apiClient.cases.getAll({ status: statusFilter, priority: priorityFilter, search: searchQuery }),
  });

  const createMutation = useMutation({
    mutationFn: (newCase: Partial<Case>) => apiClient.cases.create(newCase),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      setSelectedCaseId(created.caseNumber || created.id);
      setIsModalOpen(false);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      caseNumber: `CASE-2026-${Math.floor(100 + Math.random() * 899)}X`,
      title: '',
      status: 'ACTIVE',
      priority: 'HIGH',
      assignedTo: 'Agent Sarah Jenkins (Cyber-Physical Div)',
      location: 'Sector 4, High-Security Research Facility',
      incidentDate: new Date().toISOString().split('T')[0],
      summary: '',
      confidenceScore: 92.5,
    },
  });

  const onSubmit = (data: CaseFormValues) => {
    createMutation.mutate({
      ...data,
      incidentDate: new Date(data.incidentDate).toISOString(),
    });
    reset();
  };

  const sortedCases = [...cases].sort((a, b) => {
    if (sortBy === 'confidence') return (b.confidenceScore || 0) - (a.confidenceScore || 0);
    if (sortBy === 'priority') {
      const pWeights: Record<string, number> = { CRITICAL: 3, HIGH: 2, ROUTINE: 1 };
      return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    }
    return new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Create Button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-primary" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              CASE INTELLIGENCE & MANAGEMENT ARCHITECTURE
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Forensic Case Vault ({cases.length} Total)
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded bg-primary text-on-primary hover:bg-surface-tint font-tactical-data text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,84,76,0.35)] flex items-center gap-2 self-start md:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Initialize New Investigation Case</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <GlassCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded border border-outline-variant/40">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-tactical-data text-on-surface-variant uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-tactical-data text-xs text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-surface">All Statuses</option>
              <option value="CRITICAL" className="bg-surface">Critical</option>
              <option value="ACTIVE" className="bg-surface">Active</option>
              <option value="ARCHIVED" className="bg-surface">Archived</option>
              <option value="PENDING_AUDIT" className="bg-surface">Pending Audit</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded border border-outline-variant/40">
            <span className="text-[11px] font-tactical-data text-on-surface-variant uppercase">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent font-tactical-data text-xs text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-surface">All Priorities</option>
              <option value="CRITICAL" className="bg-surface">Critical</option>
              <option value="HIGH" className="bg-surface">High</option>
              <option value="ROUTINE" className="bg-surface">Routine</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded border border-outline-variant/40">
            <span className="text-[11px] font-tactical-data text-on-surface-variant uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-tactical-data text-xs text-primary font-bold focus:outline-none cursor-pointer"
            >
              <option value="date" className="bg-surface">Incident Date (Newest)</option>
              <option value="confidence" className="bg-surface">AI Confidence (Highest)</option>
              <option value="priority" className="bg-surface">Priority Hierarchy</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search cases, investigators, or IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 bg-surface-container-low text-xs font-tactical-data text-on-surface rounded border border-outline-variant pl-9 pr-3 focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/60"
          />
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </GlassCard>

      {/* Case Grid / List */}
      {isLoading ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : sortedCases.length === 0 ? (
        <GlassCard className="p-12 text-center text-on-surface-variant font-tactical-data">
          <span>NO CASES MATCHING CURRENT TACTICAL FILTERS.</span>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {sortedCases.map((c) => {
            const isSelected = selectedCaseId === c.caseNumber || selectedCaseId === c.id;
            return (
              <GlassCard
                key={c.id}
                active={isSelected}
                className="p-6 flex flex-col justify-between hover:border-primary/60 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-outline-variant/30">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-tactical-data text-xs text-primary font-bold">
                          {c.caseNumber}
                        </span>
                        <Badge variant={c.status.toLowerCase() as any}>{c.status}</Badge>
                        <Badge variant={c.priority.toLowerCase() as any}>{c.priority}</Badge>
                      </div>
                      <h3 className="font-display-lg text-xl font-bold uppercase text-on-surface group-hover:text-primary transition-colors">
                        {c.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => setSelectedCaseId(c.caseNumber || c.id)}
                      className={`px-3 py-1.5 rounded font-tactical-data text-xs uppercase tracking-wider transition-all border ${
                        isSelected
                          ? 'bg-primary text-on-primary border-primary font-bold shadow-[0_0_12px_rgba(255,84,76,0.4)]'
                          : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary hover:text-on-surface'
                      }`}
                    >
                      {isSelected ? 'ACTIVE CASE' : 'SELECT CASE'}
                    </button>
                  </div>

                  <p className="text-sm text-on-surface-variant font-body-md mt-4 line-clamp-2 leading-relaxed">
                    {c.summary}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-5 text-xs font-tactical-data text-on-surface-variant/90">
                    <div className="flex items-center gap-2 truncate">
                      <User className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{c.assignedTo}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{c.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{new Date(c.incidentDate).toISOString().split('T')[0]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-on-surface font-semibold">AI Conf: {c.confidenceScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs font-tactical-data">
                  <span className="text-on-surface-variant/70">LATTICE MULTI-SENSOR SYNC</span>
                  <a
                    href={`/reconstruction`}
                    className="text-primary hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Inspect 3D Room & Evidence</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Modal for Creating New Case */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Initialize New Forensic Investigation Case"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-body-md text-sm text-on-surface">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-tactical-data uppercase tracking-wider text-on-surface-variant mb-1">
                Case Identifier / Number
              </label>
              <input
                {...register('caseNumber')}
                className="w-full bg-surface-container text-on-surface rounded border border-outline-variant p-2 text-xs font-tactical-data focus:border-primary focus:outline-none"
              />
              {errors.caseNumber && <span className="text-xs text-primary">{errors.caseNumber.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-tactical-data uppercase tracking-wider text-on-surface-variant mb-1">
                Priority Hierarchy
              </label>
              <select
                {...register('priority')}
                className="w-full bg-surface-container text-on-surface rounded border border-outline-variant p-2 text-xs font-tactical-data focus:border-primary focus:outline-none"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="ROUTINE">ROUTINE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-tactical-data uppercase tracking-wider text-on-surface-variant mb-1">
              Case Title / Operation Name
            </label>
            <input
              {...register('title')}
              placeholder="e.g. Project Genesis Sub-Level 3 Breach"
              className="w-full bg-surface-container text-on-surface rounded border border-outline-variant p-2 text-xs font-tactical-data focus:border-primary focus:outline-none"
            />
            {errors.title && <span className="text-xs text-primary">{errors.title.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-tactical-data uppercase tracking-wider text-on-surface-variant mb-1">
                Assigned Lead Investigator
              </label>
              <input
                {...register('assignedTo')}
                className="w-full bg-surface-container text-on-surface rounded border border-outline-variant p-2 text-xs font-tactical-data focus:border-primary focus:outline-none"
              />
              {errors.assignedTo && <span className="text-xs text-primary">{errors.assignedTo.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-tactical-data uppercase tracking-wider text-on-surface-variant mb-1">
                Incident Location
              </label>
              <input
                {...register('location')}
                className="w-full bg-surface-container text-on-surface rounded border border-outline-variant p-2 text-xs font-tactical-data focus:border-primary focus:outline-none"
              />
              {errors.location && <span className="text-xs text-primary">{errors.location.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-tactical-data uppercase tracking-wider text-on-surface-variant mb-1">
                Incident Date
              </label>
              <input
                type="date"
                {...register('incidentDate')}
                className="w-full bg-surface-container text-on-surface rounded border border-outline-variant p-2 text-xs font-tactical-data focus:border-primary focus:outline-none"
              />
              {errors.incidentDate && <span className="text-xs text-primary">{errors.incidentDate.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-tactical-data uppercase tracking-wider text-on-surface-variant mb-1">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full bg-surface-container text-on-surface rounded border border-outline-variant p-2 text-xs font-tactical-data focus:border-primary focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="ARCHIVED">ARCHIVED</option>
                <option value="PENDING_AUDIT">PENDING AUDIT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-tactical-data uppercase tracking-wider text-on-surface-variant mb-1">
              Case Summary & Initial Field Observations
            </label>
            <textarea
              {...register('summary')}
              rows={4}
              placeholder="Provide full brief of physical entry, sensor anomalies, and suspected targets..."
              className="w-full bg-surface-container text-on-surface rounded border border-outline-variant p-2 text-xs font-body-md focus:border-primary focus:outline-none"
            />
            {errors.summary && <span className="text-xs text-primary">{errors.summary.message}</span>}
          </div>

          <div className="pt-4 border-t border-outline-variant/30 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded bg-surface-container hover:bg-surface-variant text-xs font-tactical-data uppercase transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded bg-primary text-on-primary hover:bg-surface-tint text-xs font-tactical-data font-bold uppercase transition-all shadow-[0_0_15px_rgba(255,84,76,0.4)]"
            >
              {isSubmitting ? 'Initializing...' : 'Commit Case to Vault'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
