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
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex justify-end items-center px-6 py-3 gap-4">
            <LanguageSelector />
            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none text-gray-900">{userProfile?.full_name || 'Admin User'}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{userProfile?.role || 'Administrator'}</p>
              </div>
              <Avatar className="h-9 w-9 border border-emerald-100 shadow-sm">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userProfile?.full_name || 'Admin'}&backgroundColor=059669`} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                  {userProfile?.full_name?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          {renderSection()}
        </motion.div>
      </div>
    </div>
  );
}
