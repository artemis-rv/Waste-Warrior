import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Recycle, Leaf, Trophy, ShieldCheck, ArrowRight } from 'lucide-react';
import LanguageSelector from '@/components/ui/language-selector';
import { useTranslation } from 'react-i18next';

// Assets
import WasteWarriorLogo from '@/assets/waste-warrior.jpg';
import AuthBackground from '@/assets/hero-illustration.jpg';

export default function AuthPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // State
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'resident'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn, signUp, signInWithGoogle } = useAuth();

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, {
          full_name: formData.full_name,
          phone: formData.phone,
          role: 'resident' 
        });
      } else {
        await signIn(formData.email, formData.password);
      }
    } catch (error) {
      console.error("Auth Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (credentialResponse?.credential) {
      setLoading(true);
      try {
        await signInWithGoogle(credentialResponse.credential);
      } catch (err) {
        console.error("Google login error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleError = () => {
    console.error("Google Sign-In failed or popup was closed");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetMessage('');

    try {
      // Password reset functionality placeholder
      await new Promise(resolve => setTimeout(resolve, 1000));
      throw new Error('Password reset is not yet supported on the new backend.');
    } catch (error) {
      setResetMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Password validation checks (purely visual, retaining existing behavior)
  const pwd = formData.password;
  const hasLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);

  return (
    <div className="relative min-h-screen font-sans flex flex-col overflow-x-hidden">
      
      {/* 1. BACKGROUND IMAGE WITH OVERLAY */}
      <img
        src={AuthBackground}
        alt="Sustainability Background"
        className="fixed inset-0 w-full h-full object-cover object-center"
      />
      <div className="fixed inset-0 bg-white/65 backdrop-blur-[2px] md:bg-white/60 md:backdrop-blur-[2px] z-0" />

      {/* 2. ABSOLUTE TOP RIGHT ACTIONS (LANGUAGE + CLOSE) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <LanguageSelector />
        <button 
          onClick={() => navigate('/')}
          className="p-2 bg-white/80 hover:bg-white text-gray-600 rounded-full shadow-sm backdrop-blur-sm transition-all"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 3. MAIN CENTERED CARD */}
      <main className="relative z-10 w-full max-w-[1100px] px-4 sm:px-6 mx-auto my-auto py-8 md:py-12 flex justify-center shrink-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full bg-white/95 backdrop-blur-xl rounded-[28px] border border-gray-200/70 shadow-[0_25px_80px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col lg:flex-row min-h-[600px]"
        >
          
          {/* --- LEFT BRAND PANEL (45%) --- */}
          <div className="hidden lg:flex flex-col justify-center w-[45%] bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 p-12 relative border-r border-gray-100">
            <div className="max-w-[380px] w-full mx-auto">
              {/* Logo */}
              <img 
                src={WasteWarriorLogo} 
                alt="Waste Warrior Logo" 
                className="w-[76px] h-[76px] rounded-full border-4 border-white shadow-sm mb-8" 
              />
              
              {/* Headings */}
              <h1 className="text-[36px] font-bold text-gray-900 tracking-tight leading-tight mb-2">
                Waste Warrior
              </h1>
              <p className="text-[22px] font-medium text-gray-700 mb-6">
                {t('auth.brandHeading') || 'Turn waste into'}{' '}
                <span className="text-emerald-600 font-bold">{t('auth.brandHeadingSpan') || 'impact.'}</span>
              </p>
              <p className="text-[15px] text-gray-500 mb-10 leading-relaxed">
                {t('auth.brandSub') || 'Report waste, earn rewards, and help build cleaner, greener communities.'}
              </p>
              
              {/* Benefits */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0">
                    <Recycle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-[15px]">{t('auth.reportWasteTitle') || 'Report Waste'}</h3>
                    <p className="text-[14px] text-gray-500 mt-0.5">{t('auth.reportWasteDesc') || 'Help identify and report waste in your area'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-[15px]">{t('auth.earnRewardsTitle') || 'Earn Rewards'}</h3>
                    <p className="text-[14px] text-gray-500 mt-0.5">{t('auth.earnRewardsDesc') || 'Earn green credits for positive actions'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-[15px]">{t('auth.championTitle') || 'Become a Champion'}</h3>
                    <p className="text-[14px] text-gray-500 mt-0.5">{t('auth.championDesc') || 'Climb the leaderboard and inspire others'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT AUTH PANEL (55%) --- */}
          <div className="w-full lg:w-[55%] flex flex-col items-center p-6 sm:p-10 lg:p-10 bg-white relative">
            
            {/* Mobile/Tablet Logo header */}
            <div className="lg:hidden w-full flex flex-col items-center mb-6 my-auto">
              <img 
                src={WasteWarriorLogo} 
                alt="Waste Warrior Logo" 
                className="w-16 h-16 rounded-full border-2 border-emerald-50 shadow-sm mb-4" 
              />
              <h1 className="text-[28px] font-bold text-gray-900">Waste Warrior</h1>
            </div>

            {/* Auth Form Container */}
            <div className="w-full max-w-[420px] my-auto">
              
              {showForgotPassword ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-full"
                >
                  <h2 className="text-[28px] font-bold text-gray-900 mb-2">{t('auth.resetPasswordTitle') || 'Reset Password'}</h2>
                  <p className="text-[15px] text-gray-500 mb-8">{t('auth.resetPasswordDesc') || 'Enter your email to receive a reset link.'}</p>
                  
                  {resetMessage && (
                    <div className={`p-3.5 rounded-xl text-sm mb-6 font-medium ${
                      resetMessage.includes('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {resetMessage}
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                      <label className="block text-[14px] font-semibold text-gray-700 mb-2">{t('auth.emailAddress') || t('auth.email') || 'Email Address'}</label>
                      <div className="relative">
                        <Mail className="w-[18px] h-[18px] text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="w-full pl-11 pr-4 h-[50px] rounded-xl bg-white border border-gray-200 text-[15px] text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-[50px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm hover:-translate-y-[1px] transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      {loading ? (t('auth.sendingBtn') || 'Sending...') : (t('auth.sendResetLinkBtn') || t('auth.sendResetLink') || 'Send Reset Link')}
                    </button>
                  </form>

                  <button 
                    onClick={() => { setShowForgotPassword(false); setResetMessage(''); }}
                    className="w-full mt-8 text-[14px] text-gray-500 hover:text-emerald-700 font-medium text-center transition-colors"
                  >
                    ← {t('auth.backToLogin') || 'Back to Login'}
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Segmented Control Switcher */}
                  <div className="w-full flex bg-gray-100 p-1 rounded-xl mb-8 h-[46px]">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className={`flex-1 text-[14px] rounded-lg transition-all duration-200 ${
                        !isSignUp 
                          ? 'bg-white text-emerald-700 font-semibold shadow-sm' 
                          : 'text-gray-500 font-medium hover:text-gray-700'
                      }`}
                    >
                      {t('auth.signIn') || 'Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className={`flex-1 text-[14px] rounded-lg transition-all duration-200 ${
                        isSignUp 
                          ? 'bg-white text-emerald-700 font-semibold shadow-sm' 
                          : 'text-gray-500 font-medium hover:text-gray-700'
                      }`}
                    >
                      {t('auth.signUp') || 'Sign Up'}
                    </button>
                  </div>

                  {/* Header Texts */}
                  <div className="mb-6">
                    <h2 className="text-[28px] lg:text-[32px] font-bold text-gray-900">
                      {isSignUp ? (t('auth.createAccount') || 'Create your account') : (t('auth.welcomeBack') || 'Welcome back')}
                    </h2>
                    <p className="text-[14px] lg:text-[15px] text-gray-500 mt-1.5">
                      {isSignUp 
                        ? (t('auth.createAccountSub') || 'Join the movement for cleaner communities.') 
                        : (t('auth.welcomeBackSub') || 'Continue your journey toward a cleaner community.')}
                    </p>
                  </div>

                  {/* AUTH FORM */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <AnimatePresence initial={false}>
                      {isSignUp && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="space-y-3 overflow-hidden"
                        >
                          <div>
                            <label className="block text-[14px] font-semibold text-gray-700 mb-2">{t('worker.name') || 'Full Name'}</label>
                            <div className="relative">
                              <User className="w-[18px] h-[18px] text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="text"
                                placeholder="John Doe"
                                value={formData.full_name}
                                onChange={(e) => handleInputChange('full_name', e.target.value)}
                                required={isSignUp}
                                className="w-full pl-11 pr-4 h-[48px] rounded-xl bg-white border border-gray-200 text-[15px] text-gray-900 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[14px] font-semibold text-gray-700 mb-2">{t('worker.phone') || 'Phone Number'}</label>
                            <div className="relative">
                              <Phone className="w-[18px] h-[18px] text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className="w-full pl-11 pr-4 h-[48px] rounded-xl bg-white border border-gray-200 text-[15px] text-gray-900 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div>
                      <label className="block text-[14px] font-semibold text-gray-700 mb-2">{t('auth.email') || t('auth.emailAddress') || 'Email'}</label>
                      <div className="relative">
                        <Mail className="w-[18px] h-[18px] text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="w-full pl-11 pr-4 h-[48px] rounded-xl bg-white border border-gray-200 text-[15px] text-gray-900 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[14px] font-semibold text-gray-700 mb-2">{t('auth.password') || 'Password'}</label>
                      <div className="relative">
                        <Lock className="w-[18px] h-[18px] text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                          className="w-full pl-11 pr-12 h-[48px] rounded-xl bg-white border border-gray-200 text-[15px] text-gray-900 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                        >
                          {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                        </button>
                      </div>
                      
                      <AnimatePresence initial={false}>
                        {isSignUp && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 pb-1 flex flex-wrap gap-x-4 gap-y-2 text-[12px] font-medium">
                              <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-600' : 'text-gray-400'}`}>
                                <ShieldCheck className="w-[14px] h-[14px]" /> {t('auth.charReq') || '8+ characters'}
                              </div>
                              <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600' : 'text-gray-400'}`}>
                                <ShieldCheck className="w-[14px] h-[14px]" /> {t('auth.upperReq') || 'One uppercase'}
                              </div>
                              <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600' : 'text-gray-400'}`}>
                                <ShieldCheck className="w-[14px] h-[14px]" /> {t('auth.numReq') || 'One number'}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence initial={false}>
                      {!isSignUp && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden flex justify-end"
                        >
                          <div className="pt-1 pb-1">
                            <button
                              type="button"
                              onClick={() => setShowForgotPassword(true)}
                              className="text-[14px] text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
                            >
                              {t('auth.forgotPassword') || 'Forgot Password?'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-[52px] bg-emerald-600 hover:bg-emerald-700 text-white text-[16px] font-semibold rounded-xl shadow-sm hover:-translate-y-[1px] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                            {t('common.processing') || 'Processing...'}
                          </span>
                        ) : (
                          isSignUp ? (
                            <>{t('auth.joinBtn') || 'Join Waste Warrior'} <ArrowRight className="w-[18px] h-[18px]" /></>
                          ) : (
                            <>{t('auth.signIn') || 'Sign In'} <ArrowRight className="w-[18px] h-[18px]" /></>
                          )
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Google OAuth Section */}
                  <div className="mt-5 space-y-4">
                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-gray-200 w-full"></div>
                      <span className="bg-white px-3 text-[13px] text-gray-400 font-medium uppercase tracking-wider relative z-10">
                        {t('auth.orContinueWith') || 'or'}
                      </span>
                    </div>

                    <div className="flex justify-center w-full">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        shape="rectangular"
                        size="large"
                        width="100%"
                        text={isSignUp ? "signup_with" : "signin_with"}
                        theme="outline"
                      />
                    </div>
                  </div>
                  
                  {/* Security Footer */}
                  <div className="mt-8 flex items-center justify-center gap-1.5 text-[12px] text-gray-500">
                    <ShieldCheck className="w-[14px] h-[14px] text-emerald-600" />
                    <span>{t('auth.secureInfo') || 'Your information is securely protected'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
