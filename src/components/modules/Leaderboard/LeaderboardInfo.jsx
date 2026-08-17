import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Info, Trophy, Sparkles, Award } from 'lucide-react';

export default function LeaderboardInfo() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-emerald-50/80 border border-emerald-100 overflow-hidden shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-emerald-100/80 flex items-center justify-center text-emerald-600">
                <Info className="h-7 w-7" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2 text-emerald-900">
                <Trophy className="h-7 w-7 text-emerald-600" />
                {t('leaderboard.howItWorks.title')}
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-sm md:text-base">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-emerald-800">
                    <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{t('leaderboard.howItWorks.residentsTitle')}</span>
                  </h3>
                  <ul className="space-y-2 text-emerald-700/90">
                    <li className="flex items-start gap-2">
                      <span className="text-lg">•</span>
                      <span>{t('leaderboard.howItWorks.residentsPoint1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lg">•</span>
                      <span>{t('leaderboard.howItWorks.residentsPoint2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lg">•</span>
                      <span>{t('leaderboard.howItWorks.residentsPoint3')}</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-emerald-800">
                    <Trophy className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>{t('leaderboard.howItWorks.workersTitle')}</span>
                  </h3>
                  <ul className="space-y-2 text-emerald-700/90">
                    <li className="flex items-start gap-2">
                      <span className="text-lg">•</span>
                      <span>{t('leaderboard.howItWorks.workersPoint1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lg">•</span>
                      <span>{t('leaderboard.howItWorks.workersPoint2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lg">•</span>
                      <span>{t('leaderboard.howItWorks.workersPoint3')}</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 p-4 bg-emerald-100/50 rounded-xl border border-emerald-200">
                <p className="text-sm md:text-base flex items-start gap-2 text-emerald-800 font-medium">
                  <Sparkles className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-600" />
                  <span>{t('leaderboard.howItWorks.note')}</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
