import React, { useState } from 'react';
import { Modal } from './Modal';
import { Database, FileText, Loader2, PlusCircle } from 'lucide-react';
import { useSuraagStore } from '../../store/useSuraagStore';

interface IngestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (caseId: string) => void;
}

export const IngestCaseModal: React.FC<IngestCaseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [storyline, setStoryline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setSelectedCaseId } = useSuraagStore();

  const handleIngest = async () => {
    if (!storyline.trim()) {
      setError('Please enter a storyline.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:3001/api/cases/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ storyline })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to ingest case');
      }
      
      if (data.id) {
        setSelectedCaseId(data.id);
        setStoryline('');
        onSuccess(data.id);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during ingestion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Case Ingestion" maxWidth="max-w-4xl">
      <div className="flex flex-col gap-4">
        <div className="bg-primary/10 border border-primary/30 p-3 rounded flex gap-3 text-sm text-primary">
          <Database className="w-5 h-5 shrink-0" />
          <p>
            Paste your raw storyline below. The Suraag AI engine will automatically parse the text, structure the timeline, identify suspects, and synthesize evidence for your dashboard.
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-xs font-tactical-data text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            Raw Case Intelligence (Text)
          </label>
          <textarea
            value={storyline}
            onChange={(e) => setStoryline(e.target.value)}
            placeholder="e.g. Diya and Chetany planned a murder on June 21st..."
            className="w-full h-64 bg-surface-container-low border border-outline-variant/60 rounded p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono placeholder:text-on-surface-variant/40"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="text-red-500 text-xs font-tactical-data uppercase bg-red-500/10 border border-red-500/30 p-2 rounded">
            ERROR: {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/30">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-tactical-data text-on-surface-variant hover:text-on-surface transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleIngest}
            disabled={isLoading || !storyline.trim()}
            className="px-6 py-2 bg-primary text-on-primary text-xs font-tactical-data uppercase tracking-wider rounded hover:bg-primary-dark transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                PARSING...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                INGEST CASE
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
