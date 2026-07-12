import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GlobalProvider } from './context/GlobalContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { FloatingActionButton } from './components/layout/FloatingActionButton';
import { CommandPalette } from './components/CommandPalette';
import DataIntelligenceCenter from './DataIntelligenceCenter';
import ImportBatchView from './ImportBatchView';
import DecisionStudio from './DecisionStudio';
import ExpenseDNA from './ExpenseDNA';
import Architecture from './Architecture';
import Dashboard from './Dashboard';
import Groups from './Groups';
import Expenses from './Expenses';
import Ledger from './Ledger';
import Audit from './Audit';
import Analytics from './Analytics';
import Settings from './Settings';

function App() {
  return (
    <GlobalProvider>
      <Router>
        <div className="flex min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <TopNav />
          
          <main className="flex-1 relative">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/import" element={<DataIntelligenceCenter />} />
                <Route path="/import/:batchId" element={<ImportBatchView />} />
                <Route path="/import/:batchId/investigation/:id" element={<DecisionStudio />} />
                <Route path="/expenses/:id" element={<ExpenseDNA />} />
                <Route path="/architecture" element={<Architecture />} />
                
                <Route path="/groups" element={<Groups />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/ledger" element={<Ledger />} />
                <Route path="/audit" element={<Audit />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </AnimatePresence>
          </main>
          
          <FloatingActionButton />
          <CommandPalette />
        </div>
        </div>
      </Router>
    </GlobalProvider>
  );
}

export default App;
