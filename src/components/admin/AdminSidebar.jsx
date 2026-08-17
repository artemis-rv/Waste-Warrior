import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Map, MapPin, Users, Award, Coins, Package, Briefcase, 
  FileText, CheckSquare, Download, LayoutDashboard, BookOpen, LogOut,
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';
import WasteWarriorLogo from '@/assets/waste-warrior.jpg';

export default function AdminSidebar({ activeSection, onSectionChange }) {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: t('admin.dashboard') || 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: t('admin.mapTracking') || 'Map & Tracking', icon: Map },
    { id: 'collection-points', label: t('admin.collectionPoints') || 'Collection Points', icon: MapPin },
    { id: 'users', label: t('admin.users') || 'User Management', icon: Users },
    { id: 'champions', label: t('admin.champions') || 'Green Champions', icon: Award },
    { id: 'credits', label: t('admin.credits') || 'Credits & Penalties', icon: Coins },
    { id: 'kits', label: t('admin.kits') || 'Kit Distribution', icon: Package },
    { id: 'workers', label: t('admin.workers') || 'Workers Management', icon: Briefcase },
    { id: 'reports', label: t('admin.reports') || 'Report Monitoring', icon: FileText },
    { id: 'verification', label: t('admin.verification') || 'Visit Verification', icon: CheckSquare },
    { id: 'learning-progress', label: t('admin.learningProgress') || 'Learning Progress', icon: BookOpen },
    { id: 'export', label: t('admin.exportReports') || t('admin.export') || 'Export Reports', icon: Download },
  ];

  return (
    <motion.aside 
      animate={{ width: isCollapsed ? 84 : 280 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="hidden md:flex flex-col border-r border-emerald-500/15 bg-white/75 backdrop-blur-xl shadow-xl h-full relative z-20 transition-all"
    >
      {/* Sidebar Header / Logo */}
      <div className="p-4 h-20 border-b border-emerald-500/10 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent">
        <div className="flex items-center gap-3 overflow-hidden">
          <img 
            src={WasteWarriorLogo} 
            alt="Waste Warrior Logo" 
            className="w-11 h-11 rounded-2xl border-2 border-emerald-400 shadow-md shrink-0 object-cover" 
          />
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="truncate"
            >
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">Waste Warrior</h2>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-full inline-block mt-1">Admin Portal</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Retract / Expand Floating Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-24 z-30 p-1.5 rounded-full bg-white border border-emerald-200 shadow-md text-emerald-700 hover:bg-emerald-50 hover:scale-110 transition-all"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Navigation list */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <motion.div
                key={item.id}
                whileHover={{ x: isCollapsed ? 0 : 3 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => onSectionChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25 border border-emerald-500' 
                      : 'text-slate-700 hover:bg-emerald-500/10 hover:text-emerald-800'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`shrink-0 transition-transform ${isActive ? 'h-5 w-5' : 'h-5 w-5 text-slate-500 group-hover:text-emerald-700'}`} />
                  {!isCollapsed && <span className="truncate text-sm">{item.label}</span>}
                </button>
              </motion.div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Sidebar Footer (Logout) */}
      <div className="p-3 border-t border-emerald-500/10 bg-white/40">
        <button
          onClick={signOut}
          title={isCollapsed ? (t('common.logout') || 'Logout') : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-3 bg-red-50/80 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-semibold text-sm border border-red-200/50 ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>{t('common.logout') || 'Logout'}</span>}
        </button>
      </div>
    </motion.aside>
  );
}
