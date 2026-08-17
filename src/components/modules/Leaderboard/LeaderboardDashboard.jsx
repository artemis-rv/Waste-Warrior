import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import { socket } from '@/lib/socket';
import { localizeNumber } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, TrendingUp, Award } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';
import LeaderboardInfo from './LeaderboardInfo';
import LeaderboardCard from './LeaderboardCard';

export default function LeaderboardDashboard() {
  const { t, i18n } = useTranslation();
  const { userProfile } = useAuth();
  const { width, height } = useWindowSize();
  const [activeTab, setActiveTab] = useState('residents');
  const [residents, setResidents] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [stats, setStats] = useState({
    totalReports: 0,
    totalParticipants: 0,
    totalPoints: 0,
    totalPickups: 0,
    activeStreak: 0
  });

  useEffect(() => {
    fetchLeaderboardData();
    
    socket.on('leaderboard-updates', fetchLeaderboardData);

    return () => {
      socket.off('leaderboard-updates', fetchLeaderboardData);
    };
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const res = await fetchApi('/resident/leaderboard');
      const allUsers = res?.leaderboard || [];

      const residentsList = allUsers.filter(u => u.role === 'resident');
      const workersList = allUsers.filter(u => u.role === 'worker');

      setResidents(residentsList);
      setWorkers(workersList);

      const topResident = residentsList[0];
      const topWorker = workersList[0];

      setTopPerformers({
        resident: topResident || null,
        worker: topWorker || null
      });

      setStats({
        totalReports: res?.stats?.totalReports || 0,
        totalUsers: res?.stats?.totalUsers || 0,
        monthlyReports: res?.stats?.monthlyReports || 0
      });
    } catch (error) {
      console.error('Error fetching leaderboard from API:', error);
      setResidents([]);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };



  const renderLeaderboardList = (data) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {data.map((user, index) => (
        <LeaderboardCard
          key={user.id}
          user={user}
          rank={index + 1}
          isCurrentUser={user.id === userProfile?.id}
          animationDelay={index * 0.05}
        />
      ))}

      {data.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Award className="h-20 w-20 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-lg">{t('leaderboard.noChampions')}</p>
        </motion.div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-6 bg-muted rounded-2xl">
              <div className="w-16 h-16 bg-muted-foreground/20 rounded-full"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-muted-foreground/20 rounded w-1/3"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6 lg:p-8">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* How It Works Banner */}
        <LeaderboardInfo />

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-3 relative z-10" />
              <motion.div
                className="text-4xl font-bold text-foreground relative z-10"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                {localizeNumber(stats.totalReports, i18n.language)}
              </motion.div>
              <p className="text-sm text-muted-foreground mt-2 font-medium">{t('leaderboard.totalReports')}</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16"></div>
              <Users className="h-12 w-12 text-secondary mx-auto mb-3 relative z-10" />
              <motion.div
                className="text-4xl font-bold text-foreground relative z-10"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                {localizeNumber(stats.totalUsers, i18n.language)}
              </motion.div>
              <p className="text-sm text-black mt-2 font-medium">{t('leaderboard.greenChampions')}</p>
              
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16"></div>
              <Award className="h-12 w-12 text-success mx-auto mb-3 relative z-10" />
              <motion.div
                className="text-4xl font-bold text-foreground relative z-10"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                {localizeNumber(stats.monthlyReports, i18n.language)}
              </motion.div>
              <p className="text-sm text-muted-foreground mt-2 font-medium">{t('leaderboard.thisMonth')}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-2xl">
            <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-background/40 via-background/20 to-primary/10 border border-primary/10 backdrop-blur supports-[backdrop-filter]:bg-background/30">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 bg-clip-text text-black bg-gradient-to-r from-primary to-secondary">
                <Trophy className="h-8 w-8 text-primary" />
                {t('leaderboard.title')}
              </h2>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-14 rounded-2xl bg-background/60 backdrop-blur p-1 border border-border/50">
                  <TabsTrigger 
                    value="residents" 
                    className="gap-2 rounded-xl transition-all font-semibold text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
                  >
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">{t('leaderboard.residents')}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="workers" 
                    className="gap-2 rounded-xl transition-all font-semibold text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
                  >
                    <Award className="h-5 w-5" />
                    <span className="font-semibold">{t('leaderboard.workers')}</span>
                  </TabsTrigger>
                </TabsList>

                
<AnimatePresence mode="wait">
  <TabsContent key="residents" value="residents" className="mt-0">
    {renderLeaderboardList(residents)}
  </TabsContent>

  <TabsContent key="workers" value="workers" className="mt-0">
    {renderLeaderboardList(workers)}
  </TabsContent>
</AnimatePresence>
              </Tabs>
            </div>
          </Card>
        </motion.div>

        {/* Motivation Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-8"
        >
          <div className="inline-block">
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent mb-4"></div>
            <p className="text-lg md:text-xl text-muted-foreground italic font-medium">
              💚 {t('leaderboard.quote')}
            </p>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-secondary to-transparent mt-4"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
