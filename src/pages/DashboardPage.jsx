// src/pages/DashboardPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ResidentDashboard from '@/components/dashboards/ResidentDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import WorkerDashboard from '@/components/dashboards/WorkerDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Users, LayoutDashboard, Camera, BookOpen, Coins, Award, LineChart, Truck, Target, Bell, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const { t } = useTranslation();

  const residentNavLinks = [
    { id: 'overview', label: t('dashboard.overview') || 'Overview' },
    { id: 'report', label: t('dashboard.reportWaste') || 'Report Waste' },
    { id: 'learning', label: t('dashboard.learning') || 'Learning' },
    { id: 'credits', label: t('dashboard.credits') || 'Credits' },
    { id: 'leaderboard', label: t('leaderboard.title') || 'Green Champions Leaderboard' },
    { id: 'impact', label: t('dashboard.impact') || 'Impact' },
  ];

  const workerNavLinks = [
    { id: 'pickups', label: t('worker.assignedPickups') || t('worker.dashboard') || 'Assigned Pickups' },
    { id: 'progress', label: t('worker.progressTracker') || 'Progress Tracker' },
    { id: 'notifications', label: t('worker.notifications') || 'Notifications' },
    { id: 'support', label: t('worker.support') || 'Support & Help' },
  ];

  // --- DETERMINE LINKS AND DEFAULT SECTION BASED ON ROLE ---
  let navigationLinks = residentNavLinks;
  let defaultSection = 'overview';

  if (userProfile?.role === 'worker') {
    navigationLinks = workerNavLinks;
    defaultSection = 'pickups';
  } else if (userProfile?.role === 'admin') {
    navigationLinks = residentNavLinks;
  }
  
  // --- INITIALIZE STATE ---
  const [activeSection, setActiveSection] = useState(defaultSection);

  // This effect ensures that when the userProfile loads,
  // the state updates to the correct default section.
  useEffect(() => {
    if (userProfile?.role) {

      if (userProfile.role === 'worker') {
        setActiveSection('pickups');
      } else if (userProfile.role === 'resident') {
        setActiveSection('overview');
      }
      else if (userProfile.role === 'scrap_dealer') { 
        setActiveSection('dashboard');
      }
    }
    }, [userProfile?.role]); // This runs only when the role changes/loads

    const renderDashboard = () => {
      if (!userProfile) {
        // Keep your loading state consistent
        return (
          <div className="flex items-center justify-center min-h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-[#00A86B] border-t-transparent rounded-full"
            />
          </div>
        );
      }

      // Pass activeSection and onSectionChange down to the specific dashboard
      switch (userProfile.role) {
        case 'resident':
          return <ResidentDashboard activeSection={activeSection} onSectionChange={setActiveSection} />;
        case 'worker':
          return <WorkerDashboard activeSection={activeSection} onSectionChange={setActiveSection} />;
        case 'admin':
          return <AdminDashboard activeSection={activeSection} onSectionChange={setActiveSection} />;
          
        default:
          return (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Unknown role: {userProfile.role}</p>
                </div>
              </CardContent>
            </Card>
          );
      }
    };

    // --- PASS THE 'navLinks' PROP TO THE LAYOUT FOR NON-ADMINS ---
    if (userProfile?.role === 'admin') {
      return renderDashboard();
    }

    return (
      <DashboardLayout 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        navLinks={navigationLinks} // <-- This prop now sends the correct links
      >
        {renderDashboard()}
      </DashboardLayout>
    );
  }
