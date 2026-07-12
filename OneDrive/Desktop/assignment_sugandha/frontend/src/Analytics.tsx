import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, PieChart, Users, Activity, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { useGlobal } from './context/GlobalContext';
import { EmptyState } from './components/ui/empty-state';

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useGlobal();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:8000/analytics/overview', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [refreshKey]);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Platform insights and aggregated metrics.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground animate-pulse">Computing analytics...</div>
      ) : data?.is_empty ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[
            { title: "Monthly Spending", icon: TrendingUp, desc: "Trend graph of your expenses over time will appear here." },
            { title: "Top Contributors", icon: Users, desc: "Bar chart ranking who pays the most will appear here." },
            { title: "Settlement Trend", icon: Activity, desc: "Velocity of debt resolution will appear here." },
            { title: "Import Quality", icon: ShieldAlert, desc: "Health score and anomaly analysis of imports." }
          ].map((card, i) => (
            <Card key={i} className="premium-card bg-slate-50/50 border-dashed border-slate-200">
              <CardContent className="p-8 text-center flex flex-col items-center justify-center min-h-[250px]">
                <card.icon className="w-8 h-8 text-slate-300 mb-4" />
                <h3 className="font-semibold text-slate-700 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-500">{card.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Monthly Spending Trend */}
          <Card className="premium-card lg:col-span-2">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-500"/> Monthly Spending Trend</CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex items-end justify-between h-64 gap-2">
              {data.monthly_spend.map((item: any, i: number) => {
                const max = Math.max(...data.monthly_spend.map((d: any) => d.amount));
                const height = max > 0 ? (item.amount / max) * 100 : 0;
                return (
                  <div key={i} className="flex flex-col items-center flex-1 group">
                    <div className="w-full bg-indigo-100 rounded-t-md relative flex items-end justify-center hover:bg-indigo-200 transition-colors" style={{ height: `${height}%` }}>
                      <div className="absolute -top-8 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">₹{Math.round(item.amount)}</div>
                      <div className="w-full bg-indigo-500 rounded-t-md" style={{ height: '80%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">{item.month}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Card 2: Top Contributors */}
          <Card className="premium-card">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4 text-blue-500"/> Top Contributors</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {data.top_contributors.map((user: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                    {i+1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-900">{user.user}</p>
                  </div>
                  <div className="font-bold text-slate-700">₹{user.amount}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Card 3: Settlement Trends */}
          <Card className="premium-card">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4 text-orange-500"/> Settlement Trend</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex items-end justify-between h-48 gap-2">
              {data.settlement_trend.map((item: any, i: number) => {
                const max = Math.max(...data.settlement_trend.map((d: any) => d.amount));
                const height = max > 0 ? (item.amount / max) * 100 : 0;
                return (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <div className="w-full bg-orange-100 rounded-t-sm" style={{ height: `${height}%` }}>
                      <div className="w-full bg-orange-400 opacity-80" style={{ height: '100%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">{item.date}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Card 4: Import Quality */}
          <Card className="premium-card bg-slate-900 text-white border-slate-800">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-slate-100"><ShieldAlert className="w-4 h-4 text-indigo-400"/> Import Quality</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-indigo-400">{data.import_quality.health_score}%</div>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Health Score</p>
              </div>
              <div className="space-y-3">
                {Object.entries(data.import_quality.anomalies_breakdown).map(([key, val]: [string, any], i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                    <span className="text-slate-300">{key}</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-mono">{val}</span>
                  </div>
                ))}
                {Object.keys(data.import_quality.anomalies_breakdown).length === 0 && (
                  <div className="text-center text-slate-500 text-sm py-2">No anomalies detected.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
