import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Search, ArrowRightLeft, CreditCard, BookOpen, HandCoins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { EmptyState } from './components/ui/empty-state';
import { SettleModal } from './components/ui/settle-modal';
import { Button } from './components/ui/button';
import { useGlobal } from './context/GlobalContext';

export default function Ledger() {
  const [balances, setBalances] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [explanation, setExplanation] = useState<any>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { refreshKey, triggerRefresh } = useGlobal();

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const groupsRes = await axios.get('http://localhost:8000/groups', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const groups = groupsRes.data;
        const gId = groups.length > 0 ? groups[0].id : null;
        setGroupId(gId);

        if (gId) {
          const res = await axios.get(`http://localhost:8000/balances/group/${gId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setBalances(res.data);
          
          if (explanation) {
             const expRes = await axios.get(`http://localhost:8000/balances/user/${explanation.user_id}/explanation?group_id=${gId}`, {
               headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
             });
             setExplanation(expRes.data);
          }
        } else {
          setBalances({});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBalances();
  }, [refreshKey]);

  const handleExplain = async (userId: string) => {
    try {
      const groupsRes = await axios.get('http://localhost:8000/groups', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const groups = groupsRes.data;
      const groupId = groups.length > 0 ? groups[0].id : null;
      if (!groupId) return;

      const res = await axios.get(`http://localhost:8000/balances/user/${userId}/explanation?group_id=${groupId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setExplanation(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ledger</h1>
          <p className="text-muted-foreground mt-1">Real-time immutable balance calculations.</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setModalOpen(true)}>
          <HandCoins className="w-4 h-4" /> Settle Up
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Balances List */}
        <Card className="premium-card h-fit">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-500" /> Current Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground animate-pulse">Calculating ledger...</div>
            ) : Object.keys(balances).length === 0 ? (
              <EmptyState 
                icon={BookOpen}
                title="No Ledger Entries"
                description="Ledger entries are automatically created when expenses or settlements are recorded."
              />
            ) : (
              <div className="divide-y">
                {Object.entries(balances).map(([userId, bal]: [string, any]) => (
                  <div 
                    key={userId} 
                    className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${explanation?.user_id === userId ? 'bg-indigo-50' : 'hover:bg-muted/50'}`}
                    onClick={() => handleExplain(userId)}
                  >
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{userId}</h3>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                        <Search className="w-3 h-3" /> Click to Explain Balance
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Net Balance</p>
                      <p className={`font-bold text-2xl ${bal.net_balance > 0 ? 'text-green-600' : bal.net_balance < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                        {bal.net_balance > 0 ? '+' : ''}₹{bal.net_balance}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Balance Explanation */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {explanation ? (
              <motion.div
                key="explanation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="premium-card border-indigo-200 shadow-indigo-100">
                  <CardHeader className="bg-indigo-600 text-white rounded-t-xl pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Search className="w-5 h-5 text-indigo-200" />
                      Balance Explanation
                    </CardTitle>
                    <p className="text-indigo-200 text-sm mt-1">Tracing ledger for {explanation.user_id}</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y max-h-[500px] overflow-y-auto">
                      {explanation.explanation.map((entry: any, i: number) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {entry.type === 'CREDIT' ? (
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                  <CreditCard className="w-3 h-3 text-green-600" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                  <ArrowRightLeft className="w-3 h-3 text-red-600" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{entry.description || "Settlement"}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{new Date(entry.date).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${entry.type === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {entry.type === 'CREDIT' ? '+' : '-'}₹{entry.amount}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <div className="p-4 border-t bg-slate-50 rounded-b-xl flex justify-between items-center">
                    <span className="font-bold text-slate-600">Final Calculated Balance</span>
                    <span className="font-bold text-xl text-slate-900">
                      ₹{balances[explanation.user_id]?.net_balance}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-2xl bg-slate-50"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="font-bold text-slate-700 text-lg">Explain Balance</h3>
                <p className="text-slate-500 mt-2 max-w-xs text-sm">
                  Click on any user in the ledger to trace exactly how their balance was calculated.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <SettleModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={triggerRefresh} 
        groupId={groupId}
        users={Object.keys(balances).map(id => ({ id }))}
      />
    </div>
  );
}
