import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Recycle, Gift, BarChart3, Medal, LogIn, Menu, X, Users, FileText, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import WasteWarriorLogo from '@/assets/waste-warrior.jpg';
import HeroIllustration from '@/assets/hero-landing.jpg'; 
import LanguageSelector from '@/components/ui/language-selector';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const Index = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7FBF8] font-sans text-[#172033] selection:bg-[#059669]/20 selection:text-[#059669]">
      
      {/* --- HEADER --- */}
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-3' 
            : 'bg-white/50 backdrop-blur-sm border-b border-white/20 py-4'
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 flex h-[40px] items-center justify-between">
          
          {/* Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={WasteWarriorLogo} 
              alt="Waste Warrior Logo" 
              className="w-10 h-10 lg:w-11 lg:h-11 rounded-full border border-gray-100 shadow-sm transition-transform group-hover:scale-105"
            />
            <span className="text-[20px] lg:text-[22px] font-extrabold tracking-tight text-[#172033]">
              Waste Warrior
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            <a href="#overview" className="text-[15px] font-semibold text-[#64748B] hover:text-[#059669] transition-colors">
              {t('dashboard.overview') || 'Overview'}
            </a>
            <Link to="/dashboard" className="text-[15px] font-semibold text-[#64748B] hover:text-[#059669] transition-colors">
              {t('dashboard.champions') || 'Champions'}
            </Link>
            <Link to={user ? "/learning" : "/auth"} className="text-[15px] font-semibold text-[#64748B] hover:text-[#059669] transition-colors">
              {t('dashboard.learning') || 'Learning'}
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-5">
            <div className="scale-90 origin-right">
              <LanguageSelector />
            </div>
            
            {user ? (
              <Button asChild className="bg-[#059669] hover:bg-[#047857] text-white rounded-xl px-6 h-11 font-semibold transition-all hover:shadow-md hover:-translate-y-0.5">
                <Link to="/dashboard">{t('admin.dashboard') || 'Dashboard'}</Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" className="text-[#64748B] hover:text-[#172033] hover:bg-gray-100/50 rounded-xl font-semibold px-5 h-11">
                  <Link to="/auth">
                    {t('common.logout') === 'लॉगआउट' ? 'लॉग इन' : 'Log In'}
                  </Link>
                </Button>
                <Button asChild className="bg-[#059669] hover:bg-[#047857] text-white rounded-xl px-6 h-11 font-semibold transition-all hover:shadow-md hover:-translate-y-0.5">
                  <Link to="/auth">
                    {t('dealer.registerAsDealer') ? 'Sign Up' : 'Sign Up'}
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[72px] left-0 w-full bg-white border-b shadow-lg z-40 md:hidden flex flex-col p-6 gap-6"
          >
            <nav className="flex flex-col gap-4">
              <a href="#overview" onClick={() => setIsMobileMenuOpen(false)} className="text-[16px] font-semibold text-[#172033] py-2 border-b border-gray-50">
                {t('dashboard.overview') || 'Overview'}
              </a>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-[16px] font-semibold text-[#172033] py-2 border-b border-gray-50">
                {t('dashboard.champions') || 'Champions'}
              </Link>
              <Link to={user ? "/learning" : "/auth"} onClick={() => setIsMobileMenuOpen(false)} className="text-[16px] font-semibold text-[#172033] py-2 border-b border-gray-50">
                {t('dashboard.learning') || 'Learning'}
              </Link>
            </nav>
            <div className="flex flex-col gap-4 pt-2">
              <LanguageSelector />
              {user ? (
                <Button asChild className="bg-[#059669] text-white w-full h-12 rounded-xl text-base hover:bg-[#047857]">
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                </Button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button asChild variant="outline" className="w-full h-12 rounded-xl text-base border-gray-200 hover:bg-gray-50 text-gray-900">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                  </Button>
                  <Button asChild className="bg-[#059669] text-white w-full h-12 rounded-xl text-base hover:bg-[#047857]">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden flex items-center justify-center pt-24 pb-16 min-h-[680px] h-[calc(100vh-84px)] max-h-[800px]">
        
        {/* Full Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: `url(${HeroIllustration})` }}
        />

        {/* Custom Gradient Overlay to reveal the right side */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.72) 25%, rgba(255,255,255,0.35) 48%, rgba(255,255,255,0.08) 70%, rgba(255,255,255,0.00) 100%)'
          }}
        />

        {/* Centered Hero Content */}
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12 w-full flex justify-center items-center mt-4 -translate-y-5">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center text-center max-w-[780px] w-full"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-[18px] py-[10px] rounded-full bg-[#ECFDF5]/85 border border-[#10B981]/25 text-[#059669] text-[14px] font-semibold mb-6">
              <span>🌱</span> <span>Together for a cleaner tomorrow</span>
            </div>

            {/* Headline */}
            <h1 className="text-[40px] sm:text-[46px] md:text-[54px] lg:text-[60px] xl:text-[64px] font-[800] leading-[1.05] tracking-tight text-[#172033] mb-6 max-w-[850px]">
              Shape a <span className="text-[#059669]">Greener</span> Future,<br className="hidden md:block" /> One Step at a Time
            </h1>

            {/* Description */}
            <p className="text-[16px] sm:text-[17px] md:text-[18px] text-[#334155] leading-[1.55] mb-10 max-w-[650px]">
              Join Waste Warrior to turn your eco-friendly actions into rewards. 
              Together, let's build a cleaner, healthier community for everyone.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-12">
              <Button asChild className="w-full sm:w-auto h-[52px] px-[28px] bg-[#059669] hover:bg-[#047857] text-white text-[16px] font-[600] rounded-[14px] transition-all">
                <Link to={user ? "/dashboard" : "/auth"}>
                  Start Module &rarr;
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full sm:w-auto h-[52px] px-[28px] bg-white/80 backdrop-blur hover:bg-white border-[1.5px] border-[#059669] text-[#059669] text-[16px] font-[600] rounded-[14px] transition-all">
                <Link to={user ? "/learning" : "/auth"}>
                  Learning 📖
                </Link>
              </Button>
            </div>

            {/* Inline Impact Statistics */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 lg:gap-12 w-full">
              
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <div className="text-[24px] lg:text-[28px] font-[800] text-[#172033] leading-none mb-1">1000+</div>
                  <div className="text-[12px] lg:text-[13px] text-[#475569] font-[700] uppercase tracking-[0.06em]">Active Users</div>
                </div>
              </div>

              <div className="hidden sm:block w-[1px] h-10 bg-slate-300/60" />

              <div className="flex items-center gap-3">
                <div className="text-left">
                  <div className="text-[24px] lg:text-[28px] font-[800] text-[#172033] leading-none mb-1">5000+</div>
                  <div className="text-[12px] lg:text-[13px] text-[#475569] font-[700] uppercase tracking-[0.06em]">Reports Filed</div>
                </div>
              </div>

              <div className="hidden sm:block w-[1px] h-10 bg-slate-300/60" />

              <div className="flex items-center gap-3">
                <div className="text-left">
                  <div className="text-[24px] lg:text-[28px] font-[800] text-[#172033] leading-none mb-1">100+</div>
                  <div className="text-[12px] lg:text-[13px] text-[#475569] font-[700] uppercase tracking-[0.06em]">Communities</div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* --- WHY CHOOSE SECTION --- */}
      <section id="overview" className="py-[100px] bg-[#F7FBF8] relative">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-[32px] sm:text-[38px] font-[800] text-[#172033] tracking-tight mb-4">
              Why Choose Waste Warrior? 🌿
            </h2>
            <p className="text-[18px] text-[#64748B] leading-relaxed">
              Join a community-driven platform that makes waste management rewarding and impactful.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.0 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-4px_rgba(0,0,0,0.08)] transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center mb-6 border border-[#10B981]/10">
                <Recycle className="w-6 h-6" />
              </div>
              <h3 className="text-[20px] font-bold text-[#172033] mb-3">Community Driven</h3>
              <p className="text-[15px] text-[#64748B] leading-[1.6]">
                Work together with local heroes to keep your neighborhood clean.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-4px_rgba(0,0,0,0.08)] transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center mb-6 border border-[#8B5CF6]/10">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-[20px] font-bold text-[#172033] mb-3">Earn Rewards</h3>
              <p className="text-[15px] text-[#64748B] leading-[1.6]">
                Earn green credits and unlock rewards for your positive actions.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-4px_rgba(0,0,0,0.08)] transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center mb-6 border border-[#3B82F6]/10">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-[20px] font-bold text-[#172033] mb-3">Track Impact</h3>
              <p className="text-[15px] text-[#64748B] leading-[1.6]">
                See the real impact of your actions and help your community grow.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-4px_rgba(0,0,0,0.08)] transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-[#FFF7ED] text-[#F97316] flex items-center justify-center mb-6 border border-[#F97316]/10">
                <Medal className="w-6 h-6" />
              </div>
              <h3 className="text-[20px] font-bold text-[#172033] mb-3">Be a Champion</h3>
              <p className="text-[15px] text-[#64748B] leading-[1.6]">
                Climb the leaderboard and inspire others to make a difference.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
