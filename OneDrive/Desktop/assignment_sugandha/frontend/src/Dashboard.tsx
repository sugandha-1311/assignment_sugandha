import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Users, Wallet, Activity, ArrowUpRight, Clock, 
  CheckCircle2, FileUp, Search, Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { StatusChip } from './components/ui/status-chip';
import { Button } from './components/ui/button';
import { EmptyState } from './components/ui/empty-state';
import { Link } from 'react-router-dom';
import { useGlobal } from './context/GlobalContext';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useGlobal();
  const [balances, setBalances] = useState<any>({});
  const [explanation, setExplanation] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsRes = await axios.get('http://localhost:8000/groups', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const groups = groupsRes.data;
        const groupId = groups.length > 0 ? groups[0].id : null;

        const dashPromise = axios.get(`http://localhost:8000/dashboard/overview`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const balPromise = groupId 
          ? axios.get(`http://localhost:8000/balances/group/${groupId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).catch(() => ({ data: {} }))
          : Promise.resolve({ data: {} });

        const [dashRes, balRes] = await Promise.all([dashPromise, balPromise]);
        
        setOverview(dashRes.data);
        setBalances(balRes.data);
        if (groupId) {
            setOverview(prev => ({...prev, currentGroupId: groupId}));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const handleExplain = async (userId: string) => {
    if (!overview?.currentGroupId) return;
    try {
      const res = await axios.get(`http://localhost:8000/balances/user/${userId}/explanation?group_id=${overview.currentGroupId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setExplanation(res.data);
    } catch (err) {
      console.error("Failed to explain balance");
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading Mission Control...</div>;
  }

  const isEmpty = overview?.is_empty;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground mt-1">Overview of your shared expenses and data health.</p>
        </div>
      </div>

      {isEmpty && (
        <EmptyState
          icon={Database}
          title="No expense data available yet"
          description="Your dashboard will populate automatically once financial operations begin. You can import data manually or launch the demo environment to see it in action."
          actionLabel="Import Expense Data"
          onAction={() => window.location.href = '/import'}
        />
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Import Health", value: isEmpty ? "--" : `${overview.kpis.health_score ?? 100}%`, icon: Activity, trend: "System Nominal" },
          { label: "Pending Reviews", value: isEmpty ? "0" : overview.kpis.pending_reviews, icon: Clock, trend: "Requires Attention" },
          { label: "Active Members", value: isEmpty ? "0" : overview.kpis.members, icon: Users, trend: "Across all groups" },
          { label: "Monthly Spend", value: isEmpty ? "₹0" : `₹${overview.kpis.monthly_spend}`, icon: Wallet, trend: "Current Period" }
        ].map((kpi, idx) => (
          <motion.div key={idx} variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: idx * 0.1 }}>
            <Card className="premium-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <kpi.icon className="w-5 h-5" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{kpi.label}</p>
                  <h3 className="text-2xl font-bold text-foreground">{kpi.value}</h3>
                  <p className="text-xs text-muted-foreground mt-2">{isEmpty ? "Awaiting Import" : kpi.trend}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Card className="premium-card">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 pb-4">
                <CardTitle className="text-lg">Latest Import Status</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 gap-1 hidden">
                  View All <ArrowUpRight className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                {isEmpty || !overview.latest_import ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No imports have been processed.</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Import {overview.latest_import.id.substring(0,8)}</h3>
                        <p className="text-sm text-muted-foreground">{overview.latest_import.total_rows} rows processed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusChip status={overview.latest_import.status} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Card className="premium-card">
              <CardHeader className="border-b bg-muted/30 pb-4">
                <CardTitle className="text-lg">Global Activity Feed</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isEmpty || overview.recent_activity.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">No activity recorded yet.</div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {overview.recent_activity.map((activity: any, i: number) => (
                      <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-50 text-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-slate-900 text-sm">{activity.title}</div>
                            <time className="font-mono text-xs text-indigo-500">{new Date(activity.timestamp).toLocaleTimeString()}</time>
                          </div>
                          <div className="text-slate-500 text-xs">{activity.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Center/Right Column - Member Balances & Explanation */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Card className="premium-card">
              <CardHeader className="border-b bg-muted/30 pb-4">
                <CardTitle className="text-lg">Group Balances</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {Object.keys(balances).length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No balances available.
                  </div>
                ) : (
                  <div className="divide-y">
                    {Object.entries(balances).map(([userId, bal]: [string, any]) => (
                      <div key={userId} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => handleExplain(userId)}>
                        <div>
                          <p className="font-semibold text-sm">{userId}</p>
                          <p className="text-xs text-muted-foreground">Click to explain</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${bal.net_balance > 0 ? 'text-green-600' : bal.net_balance < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                            {bal.net_balance > 0 ? '+' : ''}₹{bal.net_balance}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <AnimatePresence>
            {explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="premium-card border-indigo-200 shadow-indigo-100">
                  <CardHeader className="bg-indigo-50 border-b pb-4">
                    <CardTitle className="text-sm flex items-center gap-2 text-indigo-900">
                      <Search className="w-4 h-4" />
                      Balance Explanation: {explanation.user_id}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y max-h-64 overflow-y-auto">
                      {explanation.explanation.map((entry: any, i: number) => (
                        <div key={i} className="p-3 text-sm flex justify-between items-center">
                          <div>
                            <p className="font-medium">{entry.description || "Settlement"}</p>
                            <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${entry.type === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {entry.type === 'CREDIT' ? '+' : '-'}₹{entry.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
