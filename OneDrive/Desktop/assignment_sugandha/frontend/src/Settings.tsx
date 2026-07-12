import { Settings2, User, Palette, Globe, Shield, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and platform preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start font-medium bg-slate-100 text-slate-900"><User className="w-4 h-4 mr-2"/> Profile</Button>
          <Button variant="ghost" className="w-full justify-start text-slate-600"><Palette className="w-4 h-4 mr-2"/> Appearance</Button>
          <Button variant="ghost" className="w-full justify-start text-slate-600"><Globe className="w-4 h-4 mr-2"/> Region & Currency</Button>
          <Button variant="ghost" className="w-full justify-start text-slate-600"><Shield className="w-4 h-4 mr-2"/> Security</Button>
          <Button variant="ghost" className="w-full justify-start text-slate-600"><CreditCard className="w-4 h-4 mr-2"/> Billing</Button>
        </div>

        <div className="col-span-2 space-y-6">
          <Card className="premium-card">
            <CardHeader className="border-b bg-muted/30 pb-4">
              <CardTitle className="text-lg">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Full Name</label>
                <input type="text" defaultValue="Sugandha Choudhary" className="w-full px-3 py-2 border rounded-md" disabled />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email Address</label>
                <input type="email" defaultValue="sugandha@fairshare.app" className="w-full px-3 py-2 border rounded-md" disabled />
              </div>
              
            </CardContent>
          </Card>

          <Card className="premium-card border-red-200">
            <CardHeader className="border-b border-red-100 bg-red-50/50 pb-4">
              <CardTitle className="text-lg text-red-700">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Reset Demo Environment</h4>
                  <p className="text-sm text-slate-500">Wipe the database and reset all metrics.</p>
                </div>
                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">Reset Data</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
