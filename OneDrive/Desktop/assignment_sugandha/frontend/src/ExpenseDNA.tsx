import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Download, ArrowLeft, GitCommit, Search, Wand2, ShieldAlert, FileText, IndianRupee, Link as LinkIcon, DownloadCloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';

export default function ExpenseDNA() {
  const { id } = useParams();
  const [dna, setDna] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDNA = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/expenses/details/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setDna(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDNA();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Expense DNA...</div>;
  if (!dna) return <div className="p-8 text-center text-destructive">Failed to load Expense DNA.</div>;

  const handleExportPDF = () => {
    // In a real application, this would trigger a PDF generation service
    // For demo purposes, we can invoke window.print()
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Link to={`/`}>
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Expense DNA</h1>
            <p className="text-muted-foreground text-sm">Single Source of Truth for {dna.expense.title}</p>
          </div>
        </div>
        <Button className="hidden">
          <Download className="w-4 h-4" /> Export DNA Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          
          <Card className="premium-card">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Title</p>
                  <p className="font-semibold text-foreground text-base">{dna.expense.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-semibold text-foreground text-base">₹{dna.expense.converted_amount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payer</p>
                  <p className="font-medium text-foreground">{dna.expense.payer_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{new Date(dna.expense.expense_date).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-green-500" />
                Ledger Entries (Balance Impact)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 border-b uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dna.ledger_entries.map((entry: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{entry.user_id}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${entry.entry_type === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {entry.entry_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">₹{entry.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-500" />
                Related Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {dna.related_expenses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No deterministically related expenses found (Same payer or same date).</p>
              ) : (
                <div className="space-y-3">
                  {dna.related_expenses.map((rel: any) => (
                    <div key={rel.id} className="flex justify-between items-center p-3 border rounded-lg bg-slate-50">
                      <div>
                        <p className="font-semibold text-sm">{rel.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(rel.expense_date).toLocaleDateString()} • {rel.payer_id}</p>
                      </div>
                      <Link to={`/expenses/${rel.id}`}>
                        <Button variant="outline" size="sm">View DNA</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Timeline & Evidence */}
        <div className="col-span-1 space-y-6">
          <Card className="premium-card overflow-hidden">
            <CardHeader className="bg-slate-900 text-white">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-100">
                <Search className="w-5 h-5 text-indigo-400" />
                Evidence Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-slate-50">
               <p className="text-sm text-slate-500 mb-4">No specific anomalies flagged during import for this transaction.</p>
               <div className="text-xs text-slate-400 italic">
                 (If this was imported and flagged, validator metrics like 'Description Similarity: 98%' would appear here).
               </div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-lg">Processing Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
                
                {dna.timeline.map((event: any, i: number) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <GitCommit className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                      <div className="font-bold text-slate-900 text-sm mb-1">{event.action}</div>
                      <div className="text-slate-500 text-xs">{new Date(event.timestamp).toLocaleString()} • {event.actor}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
