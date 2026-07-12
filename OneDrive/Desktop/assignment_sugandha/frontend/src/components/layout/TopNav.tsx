import { useState } from 'react';
import { Bell, Search, Moon, Zap, Database, Beaker, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Button } from '../ui/button';
import { useLocation, Link, useNavigate } from 'react-router-dom';

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loadingDemo, setLoadingDemo] = useState(false);
  const [demoStage, setDemoStage] = useState(-1);
  
  const DEMO_STAGES = [
    "Provisioning Users",
    "Creating Demo Groups",
    "Simulating Expenses",
    "Generating Ledger Entries",
    "Populating Audit History",
    "Compiling Analytics"
  ];

  const handleLaunchDemo = async () => {
    setLoadingDemo(true);
    setDemoStage(0);
    
    // Simulate progression for visual effect
    const interval = setInterval(() => {
      setDemoStage(prev => {
        if (prev >= DEMO_STAGES.length - 1) return prev;
        return prev + 1;
      });
    }, 400);

    try {
      await axios.post('http://localhost:8000/demo/seed', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      clearInterval(interval);
      setDemoStage(DEMO_STAGES.length - 1);
      
      setTimeout(() => {
        setLoadingDemo(false);
        window.location.href = '/'; // Hard reload to populate all dashboard state
      }, 1000);
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setLoadingDemo(false);
      alert("Failed to launch demo");
    }
  };

  // Simple breadcrumb logic for demo
  const path = location.pathname;
  const breadcrumb = path === '/' ? 'Mission Control' : 
                     path.substring(1).charAt(0).toUpperCase() + path.substring(2);

  return (
    <>
    <header className="h-16 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-8">
      <div className="flex items-center gap-2">
        <Button onClick={handleLaunchDemo} variant="outline" size="sm" className="hidden md:flex gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 mr-4">
          <Zap className="w-4 h-4" />
          Launch Demo
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Platform</span>
        <span className="text-muted-foreground text-sm">/</span>
        <span className="text-sm font-semibold">{breadcrumb}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          disabled title="Coming Soon"
          className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-md border transition-colors group cursor-not-allowed opacity-50"
        >
          <Search className="w-4 h-4 group-hover:text-foreground transition-colors" />
          <span className="group-hover:text-foreground transition-colors">Search...</span>
          <kbd className="ml-4 text-[10px] font-sans bg-background border px-1.5 rounded text-muted-foreground">Ctrl+K</kbd>
        </button>
        
        <button 
          disabled title="Coming Soon"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground transition-colors relative cursor-not-allowed opacity-50"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-destructive rounded-full" />
        </button>
        
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground transition-colors" onClick={() => document.documentElement.classList.toggle('dark')}>
          <Moon className="w-4 h-4" />
        </button>
      </div>
    </header>

    {/* Demo Loader Modal */}
    <AnimatePresence>
      {loadingDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8"
          >
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
                <Beaker className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Preparing Demo Environment</h3>
              <p className="text-sm text-slate-500 mt-2">Generating realistic financial data across the entire platform.</p>
            </div>

            <div className="space-y-4">
              {DEMO_STAGES.map((stage, idx) => {
                const isCompleted = idx < demoStage;
                const isActive = idx === demoStage;
                
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isCompleted ? 'text-slate-700 dark:text-slate-300' : isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {demoStage === DEMO_STAGES.length - 1 && (
              <div className="mt-8 text-center text-emerald-600 font-bold animate-pulse">
                Launching...
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
