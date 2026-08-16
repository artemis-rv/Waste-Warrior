import { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  MapPin, 
  Award, 
  Bell, 
  FileText, 
  Gift,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Coins,
  BarChart3,
  Zap,
  Users,
  Sparkles,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import ReportForm from '@/components/forms/ReportForm';
import CreditsSystem from '@/components/features/CreditsSystem';
import { LeaderboardDashboard } from '@/components/modules/Leaderboard';
import UserProfile from '@/components/features/UserProfile';
// ✅ CORRECT LINE
import LearningPage from '@/pages/LearningPage.jsx';
import ImpactPage from '@/pages/ImpactPage';
import wasteIllustration from '@/assets/waste-management-illustration.png';
import teamSpiritIllustration from '@/assets/waste-collection.jpg';
import recyclingIllustration from '@/assets/recycling-illustration.png';

export default function ResidentDashboard({activeSection, onSectionChange}) {
  const { userProfile } = useAuth();
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    totalCredits: 0,
  });

  

  useEffect(() => {
    if (userProfile?.id) {
      fetchUserData();
      setupRealtimeListeners();
    }
  }, [userProfile]);

  const fetchUserData = async () => {
    try {
      // Fetch user's reports & notifications from Express REST API
      const [reportsRes, notificationsRes] = await Promise.all([
        fetchApi('/reports'),
        fetchApi('/notifications')
      ]);

      const reportsData = reportsRes?.reports || [];
      const notificationsData = notificationsRes?.notifications || [];

      // Calculate stats
      const totalReports = reportsData?.length || 0;
      const resolvedReports = reportsData?.filter(r => r.status === 'resolved').length || 0;
      const pendingReports = reportsData?.filter(r => r.status === 'pending').length || 0;

      setReports(reportsData);
      setNotifications(notificationsData);
      setStats({
        totalReports,
        resolvedReports,
        pendingReports,
        totalCredits: userProfile?.credits || 0,
      });
    } catch (error) {
      console.error('Error fetching data from API:', error);
      // Fallback gracefully without breaking UI
      setReports([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    // Realtime polling / fallback
    const interval = setInterval(() => {
      if (userProfile?.id) {
        fetchUserData();
      }
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const creditsToNextReward = Math.max(0, 100 - (userProfile?.credits || 0));
  const creditsProgress = Math.min(100, ((userProfile?.credits || 0) / 100) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </div>
    );
  }

const renderOverviewSection = () => (
    <motion.div
      key="overview"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* --- HERO SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Welcome - FIXED BUTTON TEXT COLOR */}
        <div 
          className="md:col-span-1 rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[180px]"
          style={{ backgroundColor: '#15803d', color: 'white' }} 
        >
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2 text-white">
              {t('dashboard.welcome', { name: userProfile?.full_name?.split(' ')[0] || 'Warrior' })}
            </h1>
            <p className="text-green-50 text-sm mb-6 opacity-90">
              {t('dashboard.welcomeSubtitle')}
            </p>
            
            <Button 
              onClick={() => onSectionChange('report')}
              className="w-full bg-white hover:bg-green-50 font-bold border-none"
              style={{ color: '#15803d' }}
            >
              <Camera className="w-4 h-4 mr-2" />
              {t('dashboard.reportWaste')}
            </Button>
          </div>
        </div>

        {/* Card 2: Green Points */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
           <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <Coins className="w-6 h-6 text-green-600" />
           </div>
           <h2 className="text-3xl font-bold text-gray-900">{stats.totalCredits}</h2>
           <p className="text-gray-500 text-sm font-medium">{t('dashboard.greenPoints')}</p>
        </div>

        {/* Card 3: Global Rank */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
           <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
           </div>
           <h2 className="text-3xl font-bold text-gray-900">#{userProfile?.rank || "12"}</h2>
           <p className="text-gray-500 text-sm font-medium">{t('leaderboard.yourRank')}</p>
        </div>
      </div>

      {/* --- STATS ROW --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: t('dashboard.reportsLookup') || "Reports Filed", value: stats.totalReports, icon: FileText, color: "#2563eb", bg: "#eff6ff" },
          { title: t('learning.completed') || "Resolved", value: stats.resolvedReports, icon: CheckCircle, color: "#059669", bg: "#ecfdf5" },
          { title: t('dashboard.pending') || "Pending", value: stats.pendingReports, icon: Clock, color: "#ea580c", bg: "#fff7ed" },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: stat.bg }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
          </div>
        ))}
      </div>
    {/* --- QUICK ACTIONS --- */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Camera, label: t('dashboard.reportWasteAction'), action: 'report', color: 'text-green-600', bg: 'bg-green-50' },
            { icon: TrendingUp, label: t('dashboard.impact'), action: 'impact', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Gift, label: t('dashboard.credits'), action: 'credits', color: 'text-purple-600', bg: 'bg-purple-50' },
            { icon: FileText, label: t('dashboard.learning'), action: 'learning', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((action) => (
            <div
              key={action.action}
              onClick={() => onSectionChange(action.action)}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md cursor-pointer flex flex-col items-center justify-center gap-2 text-center transition-all"
            >
              <div className={`w-10 h-10 rounded-full ${action.bg} flex items-center justify-center`}>
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <span className="font-semibold text-gray-700 text-sm">{action.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* --- RECENT ACTIVITY --- */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">{t('admin.recentActivity')}</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <Tabs defaultValue="reports" className="w-full">
            <div className="border-b border-gray-100 px-4 pt-2">
              <TabsList 
                className="w-full justify-start bg-transparent p-0 h-auto" 
                style={{ display: 'flex', gap: '30px' }}
              >
                <TabsTrigger 
                  value="reports" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-700 text-gray-500 rounded-none px-0 pb-3 font-medium"
                >
                  {t('dashboard.recentReports')}
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-700 text-gray-500 rounded-none px-0 pb-3 font-medium"
                >
                  {t('dashboard.recentNotifications')}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 min-h-[200px]">
              <TabsContent value="reports" className="mt-0 space-y-2">
                {reports.length > 0 ? reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${report.status === 'resolved' ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{report.title || t('reportForm.title')}</p>
                        <p className="text-xs text-gray-500">{formatDate(report.created_at)}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`capitalize ${getStatusColor(report.status)} border-0`}>
                      {report.status}
                    </Badge>
                  </div>
                )) : (
                  <p className="text-center text-gray-400 py-8 text-sm">{t('dashboard.noReports')}</p>
                )}
              </TabsContent>

              <TabsContent value="notifications" className="mt-0 space-y-2">
                {notifications.length > 0 ? notifications.map((n) => (
                  <div key={n.id} className="flex gap-3 p-3 rounded-lg bg-blue-50/50">
                     <Bell className="w-4 h-4 text-blue-500 mt-0.5" />
                     <div>
                        <p className="text-sm text-gray-800">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(n.created_at)}</p>
                     </div>
                  </div>
                )) : (
                  <p className="text-center text-gray-400 py-8 text-sm">{t('dashboard.noNotifications')}</p>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );

  // --- MISSING LOGIC RESTORED ---
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'report':
        return (
          <motion.div
            key="report"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Button 
              variant="ghost" 
              onClick={() => onSectionChange('overview')}
              className="mb-4 pl-0 hover:pl-2 transition-all"
            >
              ← {t('dashboard.overview')}
            </Button>
            <ReportForm onSubmitSuccess={() => {
              fetchUserData();
              onSectionChange('overview');
            }} />
          </motion.div>
        );
      case 'learning':
        return (
          <motion.div key="learning" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <LearningPage />
          </motion.div>
        );
      case 'credits':
        return <CreditsSystem userProfile={userProfile} />;
      case 'leaderboard':
        return <LeaderboardDashboard />;
      case 'impact':
        return <ImpactPage />;
      default:
        return renderOverviewSection();
    }
  };

  // Inside ResidentDashboard (1).jsx - CORRECTED return statement
return (
    <AnimatePresence mode="wait"> 
      {renderActiveSection()}
    </AnimatePresence> 
  );
}