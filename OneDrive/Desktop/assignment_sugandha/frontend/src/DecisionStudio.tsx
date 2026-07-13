import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, GitCommit, Search, Wand2, ShieldAlert, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { StatusChip } from './components/ui/status-chip';
import { toast } from 'sonner';

const getBusinessLanguage = (type: string) => {
  const t = type.toUpperCase();
  if (t.includes('DUPLICATE')) return "This expense appears to have already been imported";
  if (t.includes('CURRENCY')) return "Currency format looks incorrect";
  if (t.includes('AMOUNT')) return "Amount seems unusually high";
  if (t.includes('MISSING')) return "Some required information is missing";
  if (t.includes('DATE')) return "Date format needs attention";
  return type.replace(/_/g, ' ');
};

export default function DecisionStudio() {
  const { batchId, id } = useParams();
  const navigate = useNavigate();
  const [anomaly, setAnomaly] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchAnomaly = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/imports/${batchId}/anomalies/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAnomaly(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnomaly();
  }, [batchId, id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await axios.post(`http://localhost:8000/imports/anomalies/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("Resolution Approved");
      navigate(`/import/${batchId}`);
    } catch (err) {
      toast.error("Failed to approve resolution");
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Decision Studio...</div>;
  if (!anomaly) return <div className="p-8 text-center text-destructive">Failed to load anomaly data.</div>;

  const originalRowStr = anomaly.original_row ? JSON.stringify(anomaly.original_row, null, 2) : "{}";
  const normalizedRowStr = anomaly.normalized_row ? JSON.stringify(anomaly.normalized_row, null, 2) : "{}";

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Link to={`/import/${batchId}`}>
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resolution Workspace</h1>
            <p className="text-muted-foreground text-sm">Investigating issue on Row {anomaly.row_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusChip status={anomaly.status} />
          
          <Button onClick={handleApprove} disabled={actionLoading || anomaly.status === 'APPROVED'} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            {actionLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"/> : <CheckCircle2 className="w-4 h-4" />}
            Approve Resolution
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Diff & Explainability */}
        <div className="col-span-2 space-y-6">
          
          <Card className="premium-card">
            <CardHeader className="bg-red-50/50 border-b border-red-100">
              <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                <ShieldAlert className="w-5 h-5" />
                {getBusinessLanguage(anomaly.problem_type)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{anomaly.original_row?.description || anomaly.original_row?.title || 'Unknown Expense'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Paid by {anomaly.original_row?.paid_by || anomaly.original_row?.payer || 'Unknown'}</p>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    ₹{anomaly.original_row?.amount || 0}
                  </div>
                </div>
                <div className="flex justify-between text-sm text-slate-600 pt-2">
                  <span>Imported on {anomaly.original_row?.date || anomaly.original_row?.expense_date || 'Unknown Date'}</span>
                  <span>Split: {anomaly.original_row?.split_type || 'Equally among members'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card bg-indigo-50/30 border-indigo-100 overflow-hidden">
            <CardHeader className="bg-indigo-50/80 border-b border-indigo-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                <Wand2 className="w-5 h-5 text-indigo-500" />
                AI Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-100 flex items-center justify-center bg-white shadow-sm shrink-0">
                  <span className="font-bold text-2xl text-indigo-700">
                    {anomaly.confidence ? (anomaly.confidence * 100).toFixed(0) : "N/A"}%
                  </span>
                </div>
                <div>
                  <p className="text-slate-700 text-sm md:text-base leading-relaxed">
                    This expense {getBusinessLanguage(anomaly.problem_type).toLowerCase()} with a {anomaly.confidence ? (anomaly.confidence * 100).toFixed(0) : "N/A"}% confidence score. {anomaly.reason}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-indigo-100 rounded-md p-4 text-sm shadow-sm">
                <span className="font-semibold text-indigo-700 block mb-2 uppercase tracking-wider text-xs">Recommended Action:</span>
                <p className="text-slate-800 font-medium">{anomaly.suggested_action || 'Review and approve resolution'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="premium-card overflow-hidden">
            <CardHeader className="bg-slate-900 text-white">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-100">
                <Search className="w-5 h-5 text-indigo-400" />
                Explain This Decision
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-100 flex items-center justify-center bg-white shadow-sm">
                  <span className="font-bold text-xl text-indigo-700">
                    {anomaly.confidence ? (anomaly.confidence * 100).toFixed(0) : "N/A"}%
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">System Confidence</h3>
                  <p className="text-sm text-slate-500 max-w-md">{anomaly.reason}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {anomaly.explainability_metrics && Object.entries(anomaly.explainability_metrics).map(([key, value]: [str, any]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{key}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{value}</span>
                  </div>
                ))}
                {!anomaly.explainability_metrics && (
                  <div className="col-span-2 text-center text-sm text-muted-foreground py-4">
                    No detailed metrics available from the validator.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline & Metadata */}
        <div className="col-span-1 space-y-6">


          <Card className="premium-card">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-lg">Decision Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-indigo-500 text-slate-500 group-[.is-active]:text-indigo-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900 text-sm">Anomaly Detected</div>
                    </div>
                    <div className="text-slate-500 text-xs">{anomaly.problem_type}</div>
                  </div>
                </div>

                <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${anomaly.status === 'APPROVED' ? 'is-active' : ''}`}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white ${anomaly.status === 'APPROVED' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-300'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border ${anomaly.status === 'APPROVED' ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className={`font-bold text-sm ${anomaly.status === 'APPROVED' ? 'text-slate-900' : 'text-slate-400'}`}>Approved</div>
                    </div>
                    {anomaly.status === 'APPROVED' && <div className="text-slate-500 text-xs">By Current User</div>}
                  </div>
                </div>
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <GitCommit className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-400 text-sm">Ledger Updated</div>
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
