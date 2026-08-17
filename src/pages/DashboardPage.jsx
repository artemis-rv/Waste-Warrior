// src/pages/DashboardPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ResidentDashboard from '@/components/dashboards/ResidentDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import WorkerDashboard from '@/components/dashboards/WorkerDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Users, LayoutDashboard, Camera, BookOpen, Coins, Award, LineChart, Truck, Target, Bell, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// --- DEFINE NAVIGATION LINKS FOR EACH ROLE ---
const residentNavLinks = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'report', label: 'Report Waste', icon: Camera },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'credits', label: 'Credits', icon: Coins },
  { id: 'leaderboard', label: 'Leaderboard', icon: Award },
  { id: 'impact', label: 'Impact', icon: LineChart },
];

const workerNavLinks = [
  { id: 'pickups', label: 'Assigned Pickups', icon: Truck },
  { id: 'progress', label: 'Progress Tracker', icon: Target },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'support', label: 'Support & Help', icon: HelpCircle },
];

// --- (You can add Admin and ScrapDealer links here later) ---
const adminNavLinks = [
  // ... (e.g., { id: 'admin_overview', label: 'Admin Overview', icon: LayoutDashboard }) ...
];



export default function DashboardPage() {
  const { userProfile } = useAuth();

  // --- DETERMINE LINKS AND DEFAULT SECTION BASED ON ROLE ---
  let navigationLinks = residentNavLinks; // Default to resident links
  let defaultSection = 'overview';

  if (userProfile?.role === 'worker') {
    navigationLinks = workerNavLinks;
    defaultSection = 'pickups';
  } else if (userProfile?.role === 'admin') {
    // navigationLinks = adminNavLinks; // Uncomment when ready
    // defaultSection = 'admin_overview';
    navigationLinks = residentNavLinks; // Fallback for now
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
