import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { Bell, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { socket } from '@/lib/socket';
import LanguageSelector from '@/components/ui/language-selector';
import NotificationDropdown from '@/components/layout/NotificationDropdown';
import { useTranslation } from 'react-i18next';
import WasteWarriorLogo from '@/assets/waste-warrior.jpg';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function DashboardLayout({ children, activeSection, onSectionChange, navLinks }) {
  const { user, userProfile, signOut, loading } = useAuth();
  const { t } = useTranslation();
  
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notificationControls = useAnimationControls();

  useEffect(() => {
    if (userProfile?.id) {
      fetchNotificationCount();
      
      socket.on('user_notifications', fetchNotificationCount);
      socket.on('worker-notifications', fetchNotificationCount);

      return () => {
        socket.off('user_notifications', fetchNotificationCount);
        socket.off('worker-notifications', fetchNotificationCount);
      };
    }
  }, [userProfile]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { 
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const res = await fetchApi('/resident/notifications');
      const unread = (res?.notifications || []).filter(n => !n.isRead).length;
      setUnreadNotifications(unread);
    } catch (error) {
      console.error('Error fetching notifications from API:', error);
    }
  };

  const handleNotificationClick = () => {
    notificationControls.start({
      rotate: [0, -15, 15, -15, 15, 0],
      transition: { duration: 0.4, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    });
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <div className="hidden md:flex flex-col w-64 border-r bg-card h-full relative z-20">
        {/* Sidebar Header / Logo */}
        <div className="p-6 border-b flex items-center gap-3 bg-emerald-50/50">
          <img 
            src={WasteWarriorLogo} 
            alt="Waste Warrior Logo" 
            className="w-10 h-10 rounded-full border border-emerald-200 shadow-sm shrink-0" 
          />
          <h2 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">Waste Warrior</h2>
        </div>

        {/* Sidebar Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon || LayoutDashboard;
              const isActive = activeSection === link.id;

              return (
                <motion.div key={link.id} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                  <button
                    onClick={() => onSectionChange(link.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </button>
                </motion.div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer (Logout) */}
        <div className="p-4 border-t bg-card absolute bottom-0 w-64">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-medium text-sm"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>{t('common.logout') || 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* --- TOP HEADER --- */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b shadow-sm w-full">
          <div className="flex justify-between md:justify-end items-center px-4 sm:px-6 py-3 h-16 gap-4">
            
            {/* Mobile menu toggle (left) */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h2 className="ml-2 text-lg font-bold text-gray-900 tracking-tight leading-tight">Waste Warrior</h2>
            </div>

            {/* Right Side Tools */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <LanguageSelector />

              {/* Notification Bell */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={handleNotificationClick}
                  animate={notificationControls}
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showNotificationDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-gray-800"
                    >
                      <NotificationDropdown 
                        onClose={() => setShowNotificationDropdown(false)} 
                        setUnreadCount={setUnreadNotifications} 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile Area */}
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l">
                <div className="text-right">
                  <p className="text-sm font-semibold leading-none text-gray-900">{userProfile?.full_name || 'Warrior'}</p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{userProfile?.role || 'Resident'}</p>
                </div>
                <Avatar className="h-9 w-9 border border-emerald-100 shadow-sm">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userProfile?.full_name || 'User'}&backgroundColor=059669`} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                    {userProfile?.full_name?.charAt(0).toUpperCase() || 'W'}
                  </AvatarFallback>
                </Avatar>
              </div>

            </div>
          </div>
        </header>

        {/* --- MAIN PAGE CONTENT --- */}
        <main className="flex-1 overflow-auto bg-gray-50/50 p-4 sm:p-6 lg:p-8 relative z-0">
          <div className="max-w-7xl mx-auto pb-16">
            {children}
          </div>
        </main>
      </div>

      {/* --- MOBILE SIDEBAR DRAWER --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm md:hidden"
            />
            
            {/* Sidebar Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center bg-emerald-50/50">
                <div className="flex items-center gap-3">
                  <img 
                    src={WasteWarriorLogo} 
                    alt="Logo" 
                    className="w-8 h-8 rounded-full border border-emerald-200" 
                  />
                  <span className="text-lg font-bold text-gray-900 tracking-tight">Menu</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-2">
                  {navLinks.map((link) => {
                     const Icon = link.icon || LayoutDashboard;
                     return (
                      <button
                        key={link.id}
                        onClick={() => {
                          onSectionChange(link.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200
                          ${activeSection === link.id
                            ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        {link.label}
                      </button>
                    )
                  })}
                </nav>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                   onClick={signOut}
                   className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
