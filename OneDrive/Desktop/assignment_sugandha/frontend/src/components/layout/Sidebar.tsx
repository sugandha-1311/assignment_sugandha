import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  FileUp, 
  BookOpen, 
  ShieldCheck, 
  LineChart, 
  Settings,
  Hexagon
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Groups', path: '/groups', icon: Users },
  { name: 'Expenses', path: '/expenses', icon: Receipt },
  { name: 'Import Center', path: '/import', icon: FileUp, highlight: true },
  { name: 'Ledger', path: '/ledger', icon: BookOpen },
  { name: 'Audit Center', path: '/audit', icon: ShieldCheck },
  { name: 'Analytics', path: '/analytics', icon: LineChart },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 border-r bg-card h-screen sticky top-0 flex flex-col z-20">
      <div className="h-16 flex items-center px-6 border-b">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-sm">
            <Hexagon className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">FairShare</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
          Platform
        </div>
        
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-secondary rounded-md -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn("w-4 h-4", item.highlight && !isActive ? "text-indigo-500" : "")} />
              <span className={cn(item.highlight && !isActive ? "text-indigo-600 font-semibold" : "")}>
                {item.name}
              </span>
              {item.highlight && (
                <span className="ml-auto w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
            SC
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">Sugandha Choudhary</span>
            <span className="text-xs text-muted-foreground truncate">sugandha@fairshare.app</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
