import { motion } from 'framer-motion';
import { Database, Server, Component, ArrowRight, Layers, ShieldCheck, Cpu } from 'lucide-react';
import { Card, CardContent } from './components/ui/card';

export default function Architecture() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">System Architecture</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          A high-level overview of the Platform. This system is designed for scalability, data integrity, and strict traceability.
        </p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center relative py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Connection Lines (Visual only, hidden on mobile) */}
        <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-500 w-1/4"
            animate={{ 
              x: ['-100%', '400%'],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3,
              ease: "linear"
            }}
          />
        </div>

        {/* 1. React Frontend */}
        <motion.div variants={itemVariants} className="md:col-span-1 z-10">
          <Card className="premium-card text-center border-indigo-200 shadow-indigo-100">
            <CardContent className="p-6">
              <Component className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800">React Client</h3>
              <p className="text-xs text-slate-500 mt-1">Vite + TS + Tailwind v4</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Arrow */}
        <motion.div variants={itemVariants} className="hidden md:flex justify-center text-slate-400">
          <ArrowRight className="w-6 h-6" />
        </motion.div>

        {/* 2. FastAPI Backend */}
        <motion.div variants={itemVariants} className="md:col-span-1 z-10">
          <Card className="premium-card text-center border-emerald-200 shadow-emerald-100">
            <CardContent className="p-6">
              <Server className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800">FastAPI API</h3>
              <p className="text-xs text-slate-500 mt-1">Python 3.12 + Pydantic</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Arrow */}
        <motion.div variants={itemVariants} className="hidden md:flex justify-center text-slate-400">
          <ArrowRight className="w-6 h-6" />
        </motion.div>

        {/* 3. Core Services Engine */}
        <motion.div variants={itemVariants} className="md:col-span-1 z-10">
          <Card className="premium-card bg-slate-900 text-white border-slate-800 shadow-xl scale-110">
            <CardContent className="p-6 text-center">
              <Layers className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-100 text-lg">Core Engines</h3>
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-[10px] uppercase tracking-wider bg-slate-800 rounded px-2 py-1 text-slate-300 font-semibold flex items-center gap-1 justify-center"><Cpu className="w-3 h-3"/> Validator Rules</span>
                <span className="text-[10px] uppercase tracking-wider bg-slate-800 rounded px-2 py-1 text-slate-300 font-semibold flex items-center gap-1 justify-center"><ShieldCheck className="w-3 h-3"/> Ledger Engine</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Arrow */}
        <motion.div variants={itemVariants} className="hidden md:flex justify-center text-slate-400">
          <ArrowRight className="w-6 h-6" />
        </motion.div>

        {/* 4. PostgreSQL DB */}
        <motion.div variants={itemVariants} className="md:col-span-1 z-10">
          <Card className="premium-card text-center border-blue-200 shadow-blue-100">
            <CardContent className="p-6">
              <Database className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800">Database</h3>
              <p className="text-xs text-slate-500 mt-1">SQLAlchemy ORM + Alembic</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <Card className="premium-card">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-4">Design Philosophy</h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li><strong className="text-slate-900">Deterministic Confidence:</strong> Complex logic like Duplicate Detection is handled using strict deterministic rules on the backend, rather than unpredictable AI, guaranteeing 100% explainability.</li>
              <li><strong className="text-slate-900">Immutable Ledger:</strong> All balance updates are appended as CREDIT/DEBIT pairs to a double-entry Ledger Engine instead of directly mutating balances.</li>
              <li><strong className="text-slate-900">Plugin Validators:</strong> The ETL import pipeline uses an extensible `RuleEngine`. New validators can be added by simply extending the `BaseRule` class.</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="premium-card bg-slate-50">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-4 text-slate-900">Data Flow</h3>
            <div className="space-y-4 text-sm font-mono text-slate-600">
              <div className="bg-white p-3 rounded border">POST /imports/upload</div>
              <div className="pl-4 border-l-2 border-indigo-200">
                <div className="py-2">→ ImportService</div>
                <div className="py-2">→ RuleEngine.evaluate()</div>
                <div className="py-2">→ LedgerService.record()</div>
                <div className="py-2">→ PostgreSQL Save</div>
              </div>
              <div className="bg-white p-3 rounded border">HTTP 200 OK</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
