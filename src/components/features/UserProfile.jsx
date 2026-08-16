import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  Award,
  Calendar,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export default function UserProfile() {
  const { userProfile, updateProfile } = useAuth();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', userProfile.id);

      if (error) throw error;

      await updateProfile();
      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: userProfile?.full_name || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
    });
    setIsEditing(false);
  };

  const getRoleColor = (role) => {
    const colorMap = {
      resident: 'bg-blue-100 text-blue-800',
      admin: 'bg-purple-100 text-purple-800',
      worker: 'bg-green-100 text-green-800'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('dashboard.profile') || 'Your Profile'}</h2>
        <p className="text-muted-foreground">
          {t('dealer.editProfile') || 'Manage your account information and preferences'}
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userProfile?.avatar_url} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials(userProfile?.full_name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl">{userProfile?.full_name || 'User'}</CardTitle>
              <div className="flex justify-center">
                <Badge className={getRoleColor(userProfile?.role)}>
                  {userProfile?.role || 'resident'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Account Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Award className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-semibold text-lg">{userProfile?.credits || 0}</div>
                <div className="text-sm text-muted-foreground">{t('dashboard.greenPoints')}</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Calendar className="h-6 w-6 text-secondary mx-auto mb-2" />
                <div className="font-semibold text-lg">
                  {userProfile?.created_at ? 
                    new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">{t('worker.date')}</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Settings className="h-6 w-6 text-warning mx-auto mb-2" />
                <div className="font-semibold text-lg">
                  {userProfile?.kit_received ? t('dashboard.received') : t('dashboard.pending')}
                </div>
                <div className="text-sm text-muted-foreground">{t('dashboard.kitStatus')}</div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('worker.profile')}</h3>
                {!isEditing ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('common.edit')}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? t('common.loading') : t('common.save')}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    <User className="h-4 w-4 inline mr-2" />
                    {t('worker.name')}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder={t('worker.name')}
                    />
                  ) : (
                    <div className="p-3 bg-muted/30 rounded-md">
                      {userProfile?.full_name || '—'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-2" />
                    {t('worker.email')}
                  </Label>
                  <div className="p-3 bg-muted/30 rounded-md text-muted-foreground">
                    {userProfile?.email}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-2" />
                    {t('worker.phone')}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={t('worker.phone')}
                    />
                  ) : (
                    <div className="p-3 bg-muted/30 rounded-md">
                      {userProfile?.phone || '—'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    {t('dealer.address')}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder={t('dealer.address')}
                    />
                  ) : (
                    <div className="p-3 bg-muted/30 rounded-md">
                      {userProfile?.address || '—'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}