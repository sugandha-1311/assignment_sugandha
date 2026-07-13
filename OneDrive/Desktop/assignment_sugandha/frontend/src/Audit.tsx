import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, History, Database, Layers, Search, Filter } from 'lucide-react';
import { Card, CardContent } from './components/ui/card';
import { EmptyState } from './components/ui/empty-state';
import { Button } from './components/ui/button';
import { useGlobal } from './context/GlobalContext';

export default function Audit() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useGlobal();

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await axios.get('http://localhost:8000/audit', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, [refreshKey]);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Center</h1>
          <p className="text-muted-foreground mt-1">Immutable log of system events and user actions.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4" /> Audit Engine Ready
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
            <Layers className="w-4 h-4" /> Dispatcher Ready
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200">
            <Database className="w-4 h-4" /> DB Connected
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground animate-pulse">Loading audit logs...</div>
      ) : data?.is_empty ? (
        <EmptyState
          icon={History}
          title="No Audit History"
          description="System events and user actions will appear here once financial operations begin."
        />
      ) : (
        <Card className="premium-card">
          <div className="p-4 border-b flex justify-between items-center bg-slate-50">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search audit logs..." 
                className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
          </div>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 border-b uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">User ID</th>
                  <th className="px-6 py-4 font-medium">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200 capitalize">
                        {log.action.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-indigo-600">
                      {log.user_id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 font-mono text-xs">{log.entity_type} ({log.entity_id.substring(0,8)}...)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
