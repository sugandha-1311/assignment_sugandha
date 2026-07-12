import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, GitCommit, Search, Wand2, ShieldAlert, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { StatusChip } from './components/ui/status-chip';

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
      navigate(`/import/${batchId}`);
    } catch (err) {
      alert("Failed to approve");
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
            <p className="text-muted-foreground text-sm">Investigating {anomaly.problem_type} on Row {anomaly.row_number}</p>
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
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-indigo-500" />
                Data Transformation Diff
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Original Row
                  </h4>
                  <pre className="bg-red-50 text-red-900 p-4 rounded-md text-xs font-mono overflow-auto border border-red-100">
                    {originalRowStr}
                  </pre>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-green-600 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Normalized & Validated
                  </h4>
                  <pre className="bg-green-50 text-green-900 p-4 rounded-md text-xs font-mono overflow-auto border border-green-100">
                    {normalizedRowStr}
                  </pre>
                </div>
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
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-indigo-500" />
                Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="font-semibold text-lg text-foreground mb-2">
                {anomaly.suggested_action}
              </p>
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                This action requires explicit approval.
              </div>
            </CardContent>
          </Card>

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
