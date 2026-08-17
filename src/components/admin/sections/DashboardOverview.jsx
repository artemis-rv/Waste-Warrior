import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchApi } from '@/lib/api';
import { localizeNumber } from '@/lib/utils';
import { 
  Users, FileText, MapPin, Award, Briefcase, 
  Package, TrendingUp, CheckCircle, Clock, AlertTriangle, 
  Sparkles, CheckCheck, Activity 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardOverview() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    pendingReports: 0,
    completedReports: 0,
    totalWorkers: 0,
    activeWorkers: 0,
    collectionPoints: 0,
    totalCredits: 0,
    greenChampions: 0,
    pendingKits: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await fetchApi('/admin/dashboard');
      setStats({
        totalUsers: data.totalUsers || 0,
        totalReports: data.totalReports || 0,
        pendingReports: data.pendingReports || 0,
        completedReports: data.completedReports || 0,
        totalWorkers: data.totalWorkers || 0,
        activeWorkers: data.activeWorkers || 0,
        collectionPoints: data.collectionPoints || 0,
        totalCredits: data.totalCredits || 0,
        greenChampions: data.greenChampions || 0,
        pendingKits: data.pendingKits || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const statCards = [
    { title: t('admin.users') || 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { title: t('dashboard.reportsLookup') || 'Total Reports', value: stats.totalReports, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { title: t('dashboard.pending') || 'Pending Reports', value: stats.pendingReports, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { title: t('learning.completed') || 'Completed Reports', value: stats.completedReports, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { title: t('admin.workers') || 'Total Workers', value: stats.totalWorkers, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    { title: t('worker.active') || 'Active Workers', value: stats.activeWorkers, icon: Activity, color: 'text-teal-600', bg: 'bg-teal-500/10' },
    { title: t('admin.collectionPoints') || 'Collection Points', value: stats.collectionPoints, icon: MapPin, color: 'text-orange-600', bg: 'bg-orange-500/10' },
    { title: t('dashboard.credits') || 'Total Credits', value: stats.totalCredits, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { title: t('admin.champions') || 'Green Champions', value: stats.greenChampions, icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: t('admin.kits') || 'Pending Kits', value: stats.pendingKits, icon: Package, color: 'text-pink-600', bg: 'bg-pink-500/10' },
  ];

  const completionRate = stats.totalReports > 0 
    ? ((stats.completedReports / stats.totalReports) * 100).toFixed(1)
    : "0";
  const workerUtilization = stats.totalWorkers > 0 
    ? ((stats.activeWorkers / stats.totalWorkers) * 100).toFixed(1)
    : "0";
  const avgCreditsPerUser = stats.totalUsers > 0 
    ? (stats.totalCredits / stats.totalUsers).toFixed(0)
    : "0";

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-emerald-500/15 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {t('admin.dashboard')} {t('admin.overview')}
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          {t('dashboard.welcomeSubtitle') || "Welcome back! Here's what's happening with your waste management system."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Card className="bg-white/90 backdrop-blur-md border border-emerald-100/80 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {localizeNumber(stat.value, i18n.language)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border border-emerald-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              {t('worker.stats') || 'System Health'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/70 border border-emerald-100">
                <span className="text-slate-600 text-sm font-medium">{t('worker.completionRate') || 'Completion Rate'}</span>
                <span className="font-extrabold text-slate-900 text-base">
                  {localizeNumber(completionRate, i18n.language)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/70 border border-emerald-100">
                <span className="text-slate-600 text-sm font-medium">{t('worker.status') || 'Worker Utilization'}</span>
                <span className="font-extrabold text-slate-900 text-base">
                  {localizeNumber(workerUtilization, i18n.language)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/70 border border-emerald-100">
                <span className="text-slate-600 text-sm font-medium">{t('credits.title') || 'Avg Credits/User'}</span>
                <span className="font-extrabold text-slate-900 text-base">
                  {localizeNumber(avgCreditsPerUser, i18n.language)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-white border border-blue-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t('dashboard.quickActions') || 'Quick Actions Needed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.pendingReports > 0 && (
                <div className="flex items-center gap-3 p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl">
                  <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">
                    {localizeNumber(stats.pendingReports, i18n.language)} {t('dashboard.pending')} {t('dashboard.reportsLookup')}
                  </span>
                </div>
              )}
              {stats.pendingKits > 0 && (
                <div className="flex items-center gap-3 p-3 bg-orange-50/80 border border-orange-200/60 rounded-xl">
                  <Package className="h-5 w-5 text-orange-600 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">
                    {localizeNumber(stats.pendingKits, i18n.language)} {t('admin.kits')} {t('dashboard.pending')}
                  </span>
                </div>
              )}
              {stats.pendingReports === 0 && stats.pendingKits === 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 font-semibold text-center py-6 rounded-xl">
                  <CheckCheck className="h-5 w-5 text-emerald-600" />
                  <span>{t('learning.completed') || 'All caught up!'}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
