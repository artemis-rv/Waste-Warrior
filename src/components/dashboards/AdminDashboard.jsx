import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardOverview from '@/components/admin/sections/DashboardOverview';
import MapTracking from '@/components/admin/sections/MapTracking';
import CollectionPointManagement from '@/components/admin/sections/CollectionPointManagement';
import UserManagement from '@/components/admin/sections/UserManagement';
import GreenChampions from '@/components/admin/sections/GreenChampions';
import CreditsManagement from '@/components/admin/sections/CreditsManagement';
import KitDistribution from '@/components/admin/sections/KitDistribution';
import WorkersManagement from '@/components/admin/sections/WorkersManagement';
import ReportMonitoring from '@/components/admin/sections/ReportMonitoring';
import VisitVerification from '@/components/admin/sections/VisitVerification';
import ExportReports from '@/components/admin/sections/ExportReports';
import LearningProgressManagement from '@/components/admin/sections/LearningProgressManagement';
import LanguageSelector from '@/components/ui/language-selector';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { t } = useTranslation();
  const { userProfile } = useAuth();

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'map':
        return <MapTracking />;
      case 'collection-points':
        return <CollectionPointManagement />;
      case 'users':
        return <UserManagement />;
      case 'champions':
        return <GreenChampions />;
      case 'credits':
        return <CreditsManagement />;
      case 'kits':
        return <KitDistribution />;
      case 'workers':
        return <WorkersManagement />;
      case 'reports':
        return <ReportMonitoring />;
      case 'verification':
        return <VisitVerification />;
      case 'export':
        return <ExportReports />;
      case 'learning-progress':
        return <LearningProgressManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="sticky top-0 z-10 bg-white/75 backdrop-blur-xl border-b border-emerald-500/15 shadow-sm w-full">
          <div className="flex justify-between items-center px-4 sm:px-6 py-3 h-20 gap-4">
            
            {/* Left title area for mobile */}
            <div className="md:hidden flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Waste Warrior</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-full">Admin</span>
            </div>

            <div className="hidden md:block"></div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <LanguageSelector />
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-emerald-500/20 bg-white/50 px-3 py-1.5 rounded-2xl border">
                <div className="text-right">
                  <p className="text-sm font-bold leading-none text-slate-900">{userProfile?.full_name || 'Admin User'}</p>
                  <p className="text-xs text-emerald-700 font-medium mt-1 capitalize">{userProfile?.role || 'Administrator'}</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-emerald-500/30 shadow-md">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userProfile?.full_name || 'Admin'}&backgroundColor=059669`} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold">
                    {userProfile?.full_name?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative z-0">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto pb-16"
          >
            {renderSection()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
