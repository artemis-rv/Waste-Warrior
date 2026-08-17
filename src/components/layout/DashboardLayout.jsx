import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { 
  Bell, LogOut, Menu, X, LayoutDashboard, 
  ChevronLeft, ChevronRight, Sparkles 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { socket } from '@/lib/socket';
import LanguageSelector from '@/components/ui/language-selector';
import NotificationDropdown from '@/components/layout/NotificationDropdown';
import { useTranslation } from 'react-i18next';
import WasteWarriorLogo from '@/assets/waste-warrior.jpg';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function DashboardLayout({ children, activeSection, onSectionChange, navLinks = [] }) {
  const { user, userProfile, signOut, loading } = useAuth();
  const { t } = useTranslation();
  
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      <div className="min-h-screen bg-emerald-50/30 flex items-center justify-center">
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
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      
      {/* --- DESKTOP RETRACTABLE GLASS SIDEBAR --- */}
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
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-full inline-block mt-1">Eco Portal</span>
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

        {/* Sidebar Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon || LayoutDashboard;
              const isActive = activeSection === link.id;

              return (
                <motion.div key={link.id} whileHover={{ x: isCollapsed ? 0 : 3 }} whileTap={{ scale: 0.98 }}>
                  <button
                    onClick={() => onSectionChange(link.id)}
                    title={isCollapsed ? link.label : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${
                      isActive 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25 border border-emerald-500' 
                        : 'text-slate-700 hover:bg-emerald-500/10 hover:text-emerald-800'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className={`shrink-0 transition-transform ${isActive ? 'h-5 w-5' : 'h-5 w-5 text-slate-500 group-hover:text-emerald-700'}`} />
                    {!isCollapsed && (
                      <span className="truncate">{link.label}</span>
                    )}
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

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* --- TOP GLASS HEADER --- */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-emerald-500/15 shadow-sm w-full">
          <div className="flex justify-between items-center px-4 sm:px-6 py-3 h-20 gap-4">
            
            {/* Mobile menu toggle (left) */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-xl text-slate-700 hover:bg-emerald-50 transition-colors border border-emerald-200/50"
              >
                <Menu className="h-6 w-6 text-emerald-800" />
              </button>
              <h2 className="ml-3 text-lg font-bold text-slate-900 tracking-tight leading-tight">Waste Warrior</h2>
            </div>

            {/* Empty center spacing for desktop */}
            <div className="hidden md:block"></div>

            {/* Right Side Tools */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <LanguageSelector />

              {/* Notification Bell */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2.5 text-slate-700 bg-white/80 hover:bg-emerald-50 rounded-xl border border-emerald-200/60 shadow-sm transition-colors"
                  onClick={handleNotificationClick}
                  animate={notificationControls}
                >
                  <Bell className="w-5 h-5 text-emerald-800" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
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
                      className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-200/60 py-2 z-50 text-slate-800"
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
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-emerald-500/20 bg-white/50 px-3 py-1.5 rounded-2xl border">
                <div className="text-right">
                  <p className="text-sm font-bold leading-none text-slate-900">{userProfile?.full_name || 'Warrior'}</p>
                  <p className="text-xs text-emerald-700 font-medium mt-1 capitalize">{userProfile?.role || 'Resident'}</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-emerald-500/30 shadow-md">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userProfile?.full_name || 'User'}&backgroundColor=059669`} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold">
                    {userProfile?.full_name?.charAt(0).toUpperCase() || 'W'}
                  </AvatarFallback>
                </Avatar>
              </div>

            </div>
          </div>
        </header>

        {/* --- MAIN PAGE CONTENT --- */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative z-0">
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
              className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm md:hidden"
            />
            
            {/* Sidebar Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white/95 backdrop-blur-xl z-50 shadow-2xl md:hidden flex flex-col border-r border-emerald-200"
            >
              <div className="p-6 border-b border-emerald-500/15 flex justify-between items-center bg-gradient-to-r from-emerald-500/15 to-transparent">
                <div className="flex items-center gap-3">
                  <img 
                    src={WasteWarriorLogo} 
                    alt="Logo" 
                    className="w-10 h-10 rounded-2xl border-2 border-emerald-400 object-cover shadow-sm" 
                  />
                  <div>
                    <span className="text-lg font-extrabold text-slate-900 tracking-tight block leading-tight">Waste Warrior</span>
                    <span className="text-xs font-semibold text-emerald-700">Navigation Menu</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-emerald-50 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-2">
                  {navLinks.map((link) => {
                     const Icon = link.icon || LayoutDashboard;
                     const isActive = activeSection === link.id;
                     return (
                      <button
                        key={link.id}
                        onClick={() => {
                          onSectionChange(link.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200
                          ${isActive
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20' 
                            : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
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

              <div className="p-4 border-t border-emerald-500/15 bg-slate-50/80">
                <button
                   onClick={signOut}
                   className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl shadow-sm text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span>{t('common.logout') || 'Logout'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
