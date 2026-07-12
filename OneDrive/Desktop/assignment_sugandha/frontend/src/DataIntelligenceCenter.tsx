import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle, FileText, ChevronRight, Loader2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { cn } from './lib/utils';

const STAGES = [
  "Uploading",
  "Parsing",
  "Normalization",
  "Validation",
  "Similarity Analysis",
  "Membership Analysis",
  "Currency Analysis",
  "Settlement Detection",
  "Decision Queue"
];

export default function DataIntelligenceCenter() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentStage, setCurrentStage] = useState(-1);
  const [importResult, setImportResult] = useState<any>(null);
  const [errorToast, setErrorToast] = useState<{message: string, detail?: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setCurrentStage(0);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      // Simulate fast ETL visual progression while the actual backend request is processing
      const interval = setInterval(() => {
        setCurrentStage(prev => {
          if (prev >= STAGES.length - 1) return prev;
          return prev + 1;
        });
      }, 300);

      const res = await api.post('/imports/upload', formData);
      
      clearInterval(interval);
      setImportResult(res.data);
      
      if (res.data.status === 'COMPLETED' || res.data.status === 'SUCCESS') {
        setCurrentStage(STAGES.length);
      } else {
        setCurrentStage(STAGES.length - 1);
      }
      
      // Briefly show completion then redirect
      setTimeout(() => {
        navigate(`/import/${res.data.import_id || res.data.id}`);
      }, 1500);
      
    } catch (err: any) {
      clearInterval(interval);
      setUploading(false);
      setCurrentStage(-1);
      
      const errorMessage = err.response?.data?.detail || err.message || "An unknown error occurred during processing.";
      setErrorToast({
        message: "Pipeline Failed",
        detail: errorMessage
      });
      
      // Auto-dismiss toast
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Data Intelligence Center</h1>
        <p className="text-muted-foreground mt-1">Upload CSV, Excel, or PDF bank statements to begin anomaly investigation.</p>
      </motion.div>

      <Card className="premium-card">
        <CardContent className="p-8">
          <input 
            type="file" 
            accept=".csv, .xlsx, .xls, .pdf"
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
          />
          
          <AnimatePresence mode="wait">
            {!uploading ? (
              <motion.div 
                key="upload-zone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-input rounded-2xl p-16 text-center cursor-pointer hover:bg-secondary/50 hover:border-primary/30 transition-all group"
              >
                <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {file ? file.name : "Click to select data file"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload CSV or Excel formats to trigger the ETL pipeline
                </p>
                
                {file && (
                  <div className="mt-8">
                    <Button 
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpload();
                      }}
                      className="gap-2"
                    >
                      Initialize Pipeline <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="etl-pipeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 px-8 flex flex-col justify-center items-center"
              >
                <h3 className="text-xl font-bold mb-8">Processing Pipeline</h3>
                
                <div className="w-full max-w-lg space-y-4">
                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx < currentStage;
                    const isActive = idx === currentStage;
                    const isPending = idx > currentStage;

                    return (
                      <div key={stage} className="flex items-center gap-4">
                        <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : isActive ? (
                            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={cn(
                            "text-sm font-medium transition-colors duration-300",
                            isCompleted ? "text-foreground" : isActive ? "text-indigo-600" : "text-muted-foreground"
                          )}>
                            {stage === "Decision Queue" && importResult && (importResult.status === 'COMPLETED' || importResult.status === 'SUCCESS') 
                              ? "No pending investigations." 
                              : stage}
                          </span>
                        </div>
                        <div className="w-32 shrink-0 bg-secondary h-1.5 rounded-full overflow-hidden">
                          <motion.div 
                            className={cn("h-full", isCompleted ? "bg-green-500" : isActive ? "bg-indigo-500" : "bg-transparent")}
                            initial={{ width: "0%" }}
                            animate={{ width: isCompleted ? "100%" : isActive ? "60%" : "0%" }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {errorToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 shadow-lg rounded-xl p-4 max-w-sm flex items-start gap-3"
          >
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{errorToast.message}</h4>
              <p className="text-slate-500 text-xs mt-1">{errorToast.detail}</p>
            </div>
            <button 
              onClick={() => setErrorToast(null)}
              className="text-slate-400 hover:text-slate-600 ml-2"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
