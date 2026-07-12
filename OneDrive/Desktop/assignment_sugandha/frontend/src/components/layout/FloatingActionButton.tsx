import { useState, useEffect } from 'react';
import { Plus, Receipt, FileUp, Users, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GroupModal } from '../ui/group-modal';
import { ExpenseModal } from '../ui/expense-modal';
import { SettleModal } from '../ui/settle-modal';
import { useGlobal } from '../../context/GlobalContext';

const actions = [
  { name: 'Add Expense', icon: Receipt },
  { name: 'Import File', icon: FileUp },
  { name: 'Create Group', icon: Users },
  { name: 'Record Settlement', icon: ArrowRightLeft },
];

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const { triggerRefresh } = useGlobal();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const groupsRes = await axios.get('http://localhost:8000/groups', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        if (groupsRes.data.length > 0) {
          const gId = groupsRes.data[0].id;
          setGroupId(gId);
          
          const balRes = await axios.get(`http://localhost:8000/balances/group/${gId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setUsers(Object.keys(balRes.data).map(id => ({ id })));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchInfo();
  }, [isOpen]); // Fetch when FAB is opened

  const handleAction = (name: string) => {
    setIsOpen(false);
    if (name === 'Import File') navigate('/import');
    else setActiveModal(name);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-16 right-0 mb-2 flex flex-col items-end gap-2"
          >
            {actions.map((action, i) => (
              <motion.button
                key={action.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 bg-card border shadow-sm hover:bg-accent px-4 py-2.5 rounded-full whitespace-nowrap group transition-colors"
                onClick={() => handleAction(action.name)}
              >
                <span className="text-sm font-medium">{action.name}</span>
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-background transition-colors">
                  <action.icon className="w-4 h-4 text-foreground" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ring-offset-background"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </button>

      <GroupModal 
        isOpen={activeModal === 'Create Group'} 
        onClose={() => setActiveModal(null)} 
        onSuccess={triggerRefresh} 
      />
      <ExpenseModal 
        isOpen={activeModal === 'Add Expense'} 
        onClose={() => setActiveModal(null)} 
        onSuccess={triggerRefresh} 
        groupId={groupId}
      />
      <SettleModal 
        isOpen={activeModal === 'Record Settlement'} 
        onClose={() => setActiveModal(null)} 
        onSuccess={triggerRefresh} 
        groupId={groupId}
        users={users}
      />
    </div>
  );
}
