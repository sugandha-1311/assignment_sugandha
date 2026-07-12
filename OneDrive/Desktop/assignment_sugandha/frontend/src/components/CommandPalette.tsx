import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileUp, Receipt, Users, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

const actions = [
  { id: 'add-expense', name: 'Add Expense', icon: Receipt, category: 'Actions', path: '/expenses/new' },
  { id: 'create-group', name: 'Create Group', icon: Users, category: 'Actions', path: '/groups/new' },
  { id: 'import-file', name: 'Import File', icon: FileUp, category: 'Actions', path: '/import' },
  { id: 'record-settlement', name: 'Record Settlement', icon: ArrowRightLeft, category: 'Actions', path: '/ledger/settle' },
  { id: 'go-audit', name: 'Go to Audit Center', icon: ShieldCheck, category: 'Navigation', path: '/audit' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredActions = actions.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredActions.length);
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filteredActions.length) % filteredActions.length);
      }
      
      if (e.key === 'Enter') {
        e.preventDefault();
        const action = filteredActions[selectedIndex];
        if (action) {
          setIsOpen(false);
          navigate(action.path);
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, filteredActions, selectedIndex, navigate]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-xl bg-card border rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center px-4 border-b">
                <Search className="w-5 h-5 text-muted-foreground mr-2" />
                <input
                  ref={inputRef}
                  className="w-full h-14 bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground"
                  placeholder="Search commands, expenses, members..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIndex(0);
                  }}
                />
                <kbd className="hidden sm:inline-flex items-center h-6 px-2 text-[10px] font-sans bg-secondary text-muted-foreground rounded border">
                  ESC
                </kbd>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredActions.length === 0 ? (
                  <div className="py-14 text-center text-sm text-muted-foreground">
                    No results found for "{search}"
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Quick Actions
                    </div>
                    {filteredActions.map((action, index) => {
                      const isSelected = index === selectedIndex;
                      return (
                        <div
                          key={action.id}
                          className={cn(
                            "flex items-center px-3 py-3 rounded-lg text-sm cursor-pointer transition-colors",
                            isSelected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                          )}
                          onMouseEnter={() => setSelectedIndex(index)}
                          onClick={() => {
                            setIsOpen(false);
                            navigate(action.path);
                          }}
                        >
                          <action.icon className={cn("w-4 h-4 mr-3", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")} />
                          <span className="font-medium">{action.name}</span>
                          <span className={cn("ml-auto text-xs", isSelected ? "text-primary-foreground/60" : "text-muted-foreground")}>
                            {action.category}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
