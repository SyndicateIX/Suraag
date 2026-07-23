import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UploadCloud,
  FileText,
  Video,
  Image as ImageIcon,
  Volume2,
  MapPin,
  Camera,
  Search,
  Filter,
  CheckCircle2,
  Cpu,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { Evidence } from '../types';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ComputerVisionModal } from '../components/evidence/ComputerVisionModal';

export const EvidenceVault: React.FC = () => {
  const queryClient = useQueryClient();
  const { selectedCaseId } = useSuraagStore();
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<{
    name: string;
    progress: number;
    step: string;
  } | null>(null);
  const [selectedEvidenceForVision, setSelectedEvidenceForVision] = useState<Evidence | null>(null);

  const { data: evidenceList = [], isLoading } = useQuery({
    queryKey: ['evidence', { selectedCaseId, categoryFilter }],
    queryFn: () => apiClient.evidence.getAll({ caseId: selectedCaseId, category: categoryFilter }),
  });

  const uploadMutation = useMutation({
    mutationFn: (data: { fileName: string; fileType: string; caseId?: string; category?: string }) =>
      apiClient.evidence.processUpload(data),
    onSuccess: (newEv) => {
      queryClient.invalidateQueries({ queryKey: ['evidence'] });
      setTimeout(() => {
        setUploadingFile(null);
        setSelectedEvidenceForVision(newEv);
      }, 800);
    },
  });

  const simulateUploadPipeline = (fileName: string, fileType: string) => {
    let progress = 10;
    setUploadingFile({ name: fileName, progress, step: 'Scanning file integrity & header extraction...' });

    const interval = setInterval(() => {
      progress += 25;
      if (progress === 35) {
        setUploadingFile({ name: fileName, progress, step: 'Running YOLOv9 / Segment-Anything vision models...' });
      } else if (progress === 60) {
        setUploadingFile({ name: fileName, progress, step: 'Extracting EXIF metadata & GPS telemetry...' });
      } else if (progress === 85) {
        setUploadingFile({ name: fileName, progress, step: 'Computing bounding box confidence weights...' });
      } else if (progress >= 100) {
        clearInterval(interval);
        setUploadingFile({ name: fileName, progress: 100, step: 'Object Detection & Indexing Complete!' });
        
        let inferredCategory = 'DOCUMENT';
        if (fileName.toLowerCase().includes('gun') || fileName.toLowerCase().includes('glock') || fileName.toLowerCase().includes('weapon')) {
          inferredCategory = 'WEAPON';
        } else if (fileName.toLowerCase().includes('blood') || fileName.toLowerCase().includes('spatter')) {
          inferredCategory = 'BLOOD';
        } else if (fileName.toLowerCase().includes('cctv') || fileName.toLowerCase().includes('cam')) {
          inferredCategory = 'CCTV';
        } else if (fileName.toLowerCase().includes('boot') || fileName.toLowerCase().includes('foot')) {
          inferredCategory = 'FOOTPRINT';
        }

        uploadMutation.mutate({
          fileName,
          fileType,
          caseId: selectedCaseId,
          category: inferredCategory,
        });
      }
    }, 600);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      simulateUploadPipeline(files[0].name, files[0].type || 'image/jpeg');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateUploadPipeline(files[0].name, files[0].type || 'image/jpeg');
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'WEAPON':
      case 'BALLISTICS':
        return AlertCircle;
      case 'CCTV':
      case 'VIDEO':
        return Video;
      case 'AUDIO':
      case 'PHONE':
        return Volume2;
      case 'GPS':
        return MapPin;
      case 'DOCUMENT':
      case 'PDF':
        return FileText;
      default:
        return ImageIcon;
    }
  };

  const filteredEvidence = evidenceList.filter((e) => {
    if (!searchQuery) return true;
    return (
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Case indicator */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              MULTI-MODAL FORENSIC INGESTION & VISION LAB
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Evidence Vault & Computer Vision Results
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="confidence" pulse>YOLOv9 VISION ONLINE</Badge>
          <Badge variant="routine">{filteredEvidence.length} ITEMS CATALOGED</Badge>
        </div>
      </div>

      {/* Interactive Drag and Drop Upload Box & Processing Progress */}
      <GlassCard
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`p-8 border-2 border-dashed transition-all text-center rounded-lg ${
          isDragOver
            ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(255,84,76,0.3)]'
            : 'border-outline-variant/60 hover:border-primary/70 bg-surface/60'
        }`}
      >
        {uploadingFile ? (
          <div className="max-w-xl mx-auto space-y-4 py-4">
            <div className="flex items-center justify-between font-tactical-data text-xs">
              <span className="text-primary font-bold uppercase flex items-center gap-2 truncate">
                <Cpu className="w-4 h-4 animate-spin" />
                <span>PROCESSING: {uploadingFile.name}</span>
              </span>
              <span className="text-on-surface font-semibold">{uploadingFile.progress}%</span>
            </div>

            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 shadow-[0_0_12px_#ff544c]"
                style={{ width: `${uploadingFile.progress}%` }}
              />
            </div>

            <p className="text-xs font-tactical-data text-on-surface-variant animate-pulse">
              {uploadingFile.step}
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-3">
            <div className="w-16 h-16 rounded-full bg-surface-container-high border border-primary/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,84,76,0.2)]">
              <UploadCloud className="w-8 h-8 text-primary animate-bounce" style={{ animationDuration: '3s' }} />
            </div>

            <div>
              <h3 className="font-display-lg text-lg font-bold uppercase text-on-surface">
                Drag & Drop Forensic Files into the Vault
              </h3>
              <p className="text-xs text-on-surface-variant font-body-md mt-1 max-w-lg mx-auto">
                Accepts Images (`.jpg, .png`), Videos (`.mp4, CCTV feeds`), Audio (`.wav, intercept`), PDFs, GPS Logs, and Documents. Automated computer vision immediately extracts bounding boxes and confidence weights.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 font-tactical-data text-[10px]">
              {['WEAPONS', 'BLOOD SPATTER', 'FOOTPRINTS', 'CCTV FRAMES', 'BALLISTICS', 'FINGERPRINTS'].map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant text-on-surface-variant">
                  {tag}
                </span>
              ))}
            </div>

            <div className="pt-2">
              <label className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-primary text-on-primary font-tactical-data text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-surface-tint transition-all shadow-[0_0_15px_rgba(255,84,76,0.35)]">
                <Camera className="w-4 h-4" />
                <span>Browse Local Files to Ingest</span>
                <input type="file" onChange={handleFileSelect} className="hidden" />
              </label>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Filter Toolbar */}
      <GlassCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 font-tactical-data text-xs w-full sm:w-auto">
          <Filter className="w-4 h-4 text-primary mr-1" />
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'WEAPON', label: 'Weapons' },
            { id: 'BLOOD', label: 'Blood' },
            { id: 'BALLISTICS', label: 'Ballistics' },
            { id: 'CCTV', label: 'CCTV' },
            { id: 'FOOTPRINT', label: 'Footprints' },
            { id: 'PHONE', label: 'Phones/Digital' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded transition-all border ${
                categoryFilter === cat.id
                  ? 'bg-secondary-container text-primary border-primary font-bold shadow-[0_0_10px_rgba(255,84,76,0.3)]'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search evidence titles or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 bg-surface-container-low text-xs font-tactical-data text-on-surface rounded border border-outline-variant pl-9 pr-3 focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/60"
          />
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </GlassCard>

      {/* Evidence Catalog Grid */}
      {isLoading ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : filteredEvidence.length === 0 ? (
        <GlassCard className="p-12 text-center text-on-surface-variant font-tactical-data">
          <span>NO EVIDENCE ITEMS MATCHING CURRENT CATEGORY OR SEARCH QUERY.</span>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvidence.map((ev) => {
            const Icon = getCategoryIcon(ev.category);
            const boxCount = ev.boundingBoxes?.length || 1;
            return (
              <GlassCard
                key={ev.id}
                className="p-5 flex flex-col justify-between hover:border-primary/70 transition-all group overflow-hidden"
              >
                <div>
                  <div className="relative aspect-video rounded overflow-hidden bg-black mb-4 border border-outline-variant/40 group-hover:border-primary/50 transition-colors">
                    <img
                      src={ev.fileUrl}
                      alt={ev.title}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <Badge variant="critical" className="text-[10px]">
                        {ev.category}
                      </Badge>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between font-tactical-data text-[11px] text-primary bg-black/70 backdrop-blur-md px-2 py-1 rounded border border-primary/40">
                      <span>CONFIDENCE:</span>
                      <span className="font-bold">{ev.confidence}%</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded bg-surface-container border border-outline-variant/40 shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display-lg font-bold text-base text-on-surface uppercase group-hover:text-primary transition-colors line-clamp-1">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant/80 font-tactical-data mt-0.5">
                        {boxCount} bounding box object{boxCount > 1 ? 's' : ''} indexed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                  <span className="text-[10px] font-tactical-data text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>AI PROCESSED</span>
                  </span>

                  <button
                    onClick={() => setSelectedEvidenceForVision(ev)}
                    className="px-3 py-1.5 rounded bg-primary/20 hover:bg-primary text-primary hover:text-on-primary border border-primary/50 transition-all font-tactical-data text-xs font-bold uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,84,76,0.2)]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Vision</span>
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Computer Vision Results Popup Modal */}
      <ComputerVisionModal
        evidence={selectedEvidenceForVision}
        isOpen={!!selectedEvidenceForVision}
        onClose={() => setSelectedEvidenceForVision(null)}
      />
    </div>
  );
};
