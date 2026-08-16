import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';

import { fetchApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Users, TrendingUp } from 'lucide-react';

export default function GreenChampionsLeaderboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    totalUsers: 0,
    monthlyReports: 0
  });

  useEffect(() => {
    fetchLeaderboardData();
    fetchStats();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const data = await fetchApi('/resident/leaderboard');
      setLeaderboard(data.champions || []);
      setUserRank(data.currentUserRank);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Stats are now fetched alongside leaderboard data
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-orange-500" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-500';
      case 2: return 'bg-gray-400';
      case 3: return 'bg-orange-500';
      default: return 'bg-primary';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-sm text-muted-foreground">{t('leaderboard.totalReports')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-sm text-muted-foreground">{t('leaderboard.greenChampions')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.monthlyReports}</div>
            <p className="text-sm text-muted-foreground">{t('leaderboard.thisMonth')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Your Rank */}
      {userRank && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">{t('leaderboard.yourRank')}</h3>
              <div className="flex items-center justify-center gap-2">
                {getRankIcon(userRank)}
                <span className="text-xl font-bold">{t('leaderboard.rank', { rank: userRank })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {t('leaderboard.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((champion, index) => (
              <div
                key={champion.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  champion.id === user?.id ? 'bg-primary/5 border-primary' : 'bg-background'
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(index + 1)}
                </div>

                {/* Avatar */}
                <Avatar className="h-12 w-12">
                  <AvatarImage src={champion.avatar_url} alt={champion.full_name} />
                  <AvatarFallback className="bg-primary/10">
                    {getInitials(champion.full_name)}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {champion.full_name || t('leaderboard.anonymousChampion')}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{champion.reportsCount} {t('leaderboard.reports')}</span>
                    <span>{champion.monthlyReports} {t('leaderboard.thisMonthReports')}</span>
                  </div>
                </div>

                {/* Credits & Badge */}
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {champion.credits} {t('leaderboard.credits')}
                  </div>
                  {index < 3 && (
                    <Badge className={getRankBadgeColor(index + 1)}>
                      {index === 0 ? t('leaderboard.goldChampion') : index === 1 ? t('leaderboard.silverChampion') : t('leaderboard.bronzeChampion')}
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {leaderboard.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>{t('leaderboard.noChampions')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
