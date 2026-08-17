import { motion } from 'framer-motion';
import { Map, MapPin, Users, Award, Coins, Package, Briefcase, FileText, CheckSquare, Download, LayoutDashboard, BookOpen, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';
import WasteWarriorLogo from '@/assets/waste-warrior.jpg';
export default function AdminSidebar({ activeSection, onSectionChange }) {
  const { t } = useTranslation();
  const { signOut } = useAuth();

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
    <div className="w-64 border-r bg-card h-full relative">
      <div className="p-6 border-b flex items-center gap-3 bg-emerald-50/50">
        <img 
          src={WasteWarriorLogo} 
          alt="Waste Warrior Logo" 
          className="w-10 h-10 rounded-full border border-emerald-200 shadow-sm shrink-0" 
        />
        <h2 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">Waste Warrior</h2>
      </div>

      <ScrollArea className="h-[calc(100vh-10rem)]">
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <motion.div
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => onSectionChange(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              </motion.div>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t absolute bottom-0 w-64 bg-card">
        <Button
          variant="destructive"
          className="w-full justify-start gap-3 bg-red-50 hover:bg-red-100 text-red-600 border-none shadow-none"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">{t('logout') || 'Logout'}</span>
        </Button>
      </div>
    </div>
  );
}
