import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Activity, CheckCircle, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { StatusChip } from './components/ui/status-chip';
import { DataTable, Column } from './components/ui/data-table';

export default function ImportBatchView() {
  const { batchId } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/imports/${batchId}/report`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setReport(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [batchId]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading batch data...</div>;
  if (!report) return <div className="p-8 text-center text-destructive">Failed to load batch data.</div>;

  const columns: Column<any>[] = [
    { header: "Row", accessorKey: "row_number", sortable: true },
    { 
      header: "Severity", 
      accessorKey: "severity",
      cell: (item) => <StatusChip status={item.severity as any} />
    },
    { header: "Category", accessorKey: "problem_type", sortable: true },
    { header: "Confidence", accessorKey: "confidence", 
      cell: (item) => item.confidence ? `${(item.confidence * 100).toFixed(0)}%` : 'N/A'
    },
    { 
      header: "Action", 
      accessorKey: "id",
      cell: (item) => (
        <Link to={`/import/${batchId}/investigation/${item.id}`}>
          <Button variant="outline" size="sm">Investigate</Button>
        </Link>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">{report.filename}</h1>
            <StatusChip status={report.status} />
          </div>
          <p className="text-muted-foreground">Import Batch {report.import_id.split('-')[0]}</p>
        </motion.div>
        <Button variant="outline" className="hidden">
          <Download className="w-4 h-4" /> Export PDF Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Summary & Impact */}
        <div className="col-span-2 space-y-6">
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <Card className="premium-card overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b p-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-300">Investigation Summary</h3>
              </div>
              <CardContent className="p-6">
                <p className="text-lg mb-4">{report.summary.text}</p>
                <div className="flex items-start gap-8">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Most Common Issue</p>
                    <p className="font-medium text-foreground">{report.summary.most_common_issue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Recommendation</p>
                    <p className="font-medium text-foreground">{report.summary.recommendation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Detected Anomalies
            </h3>
            <DataTable 
              data={report.anomalies} 
              columns={columns} 
              searchPlaceholder="Search by category or severity..."
            />
          </motion.div>
          
        </div>

        {/* Right Column: Health & Metrics */}
        <div className="col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="premium-card">
              <CardHeader className="border-b bg-muted/20 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Import Health
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-muted" />
                      <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="226" strokeDashoffset={226 - (226 * report.health_score) / 100} className="text-green-500 transition-all duration-1000" />
                    </svg>
                    <div className="absolute font-bold text-xl">{report.health_score}%</div>
                  </div>
                  <div>
                    <p className="font-medium">Excellent</p>
                    <p className="text-xs text-muted-foreground">Based on {report.metrics.total_rows} rows</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500"/> Clean Rows</span>
                    <span className="font-medium">{report.metrics.successful_rows}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"/> Warnings</span>
                    <span className="font-medium">{report.metrics.pending_review_rows}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"/> Critical Errors</span>
                    <span className="font-medium">{report.metrics.failed_rows}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="premium-card bg-slate-900 text-slate-50 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-200">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Impact Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-4">Simulated ledger impact if all anomalies are approved.</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Current Balance</span>
                  <span className="font-medium">₹{report.impact_preview.current_balance.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-indigo-400 text-sm">Projected Import</span>
                  <span className="font-medium text-indigo-400">+₹{(report.impact_preview.projected_balance - report.impact_preview.current_balance).toLocaleString()}</span>
                </div>
                <div className="h-px w-full bg-slate-800 mb-4" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">Projected Balance</span>
                  <span className="font-bold text-xl text-white">₹{report.impact_preview.projected_balance.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
